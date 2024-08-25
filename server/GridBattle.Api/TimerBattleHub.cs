using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Data;

public sealed class TimerBattleHub(GridDbContext dbContext) : Hub
{
    private const string USERNAME = "USERNAME";
    private const string ROOM_ID = "ROOM_ID";

    public async Task<TimerBattleRoom> CreateBattle(string name)
    {
        var newBattle = new TimerBattleRoom()
        {
            RoomId = IdCodeGenerator.GenerateId(4),
            ModifiedDateTime = DateTimeOffset.UtcNow,
            Players =
            [
                new()
                {
                    Name = name,
                    IsActive = true,
                    Scores = [],
                },
            ],
            RoundNumber = 0,
            State = TimerBattleRoom.TimerBattleState.WaitingToStart,
        };
        dbContext.Add(newBattle);
        await dbContext.SaveChangesAsync();

        await Groups.AddToGroupAsync(Context.ConnectionId, newBattle.RoomId);
        Context.Items[USERNAME] = name;
        Context.Items[ROOM_ID] = newBattle.RoomId;

        return newBattle;
    }

    public async Task<TimerBattleRoom> JoinBattle(string roomId, string name)
    {
        var battle = await ExecuteInBattleAsync(
            roomId,
            (battle) =>
            {
                var existingPlayer = battle.Players.FirstOrDefault(x => x.Name == name);
                if (existingPlayer is not null)
                {
                    if (existingPlayer.IsActive)
                    {
                        throw new InvalidOperationException(
                            "A Player with this name is already in the game"
                        );
                    }
                    else
                    {
                        existingPlayer.IsActive = true;
                    }
                }
                else
                {
                    if (battle.State != TimerBattleRoom.TimerBattleState.WaitingToStart)
                    {
                        throw new InvalidOperationException(
                            "Cannot join a game after it has started"
                        );
                    }

                    battle.Players.Add(
                        new()
                        {
                            Name = name,
                            IsActive = true,
                            Scores = [],
                        }
                    );
                }
            }
        );

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        Context.Items[USERNAME] = name;
        Context.Items[ROOM_ID] = roomId;
        return battle;
    }

    public async Task StartBattle(string gridId) =>
        await ExecuteInBattleAsync(async battle =>
        {
            if (battle.State is TimerBattleRoom.TimerBattleState.InProgress)
            {
                throw new InvalidOperationException("A battle is already in progress");
            }

            var grid =
                await dbContext.Grids.Where(x => x.Id == gridId).SingleOrDefaultAsync()
                ?? throw new InvalidOperationException("Provided Grid not found");
            battle.Grid = grid;
            battle.RoundNumber++;
            battle.RoundStartedAt = DateTimeOffset.UtcNow;
            battle.State = TimerBattleRoom.TimerBattleState.InProgress;
        });

    public async Task UpdateScore(int matchCount, int penalties) =>
        await ExecuteInBattleAsync(battle =>
        {
            if (battle.State is not TimerBattleRoom.TimerBattleState.InProgress)
            {
                throw new InvalidOperationException(
                    "Trying to update a score when the battle is not in progress"
                );
            }
            if (battle.Grid is null)
            {
                throw new InvalidOperationException(
                    "Trying to update a score when the battle does not have an active grid"
                );
            }

            var player =
                battle.Players.FirstOrDefault(x => x.Name == GetUsername())
                ?? throw new InvalidOperationException(
                    "Unexpected error: Current player not found in room"
                );
            if (player.Scores.Count <= battle.RoundNumber)
            {
                player.Scores.Add(new() { MatchCount = 0, Penalties = 0 });
            }

            var roundScore = player.Scores[battle.RoundNumber];
            roundScore.MatchCount = matchCount;
            roundScore.Penalties = penalties;
            // If the player has matched all categories, record the time it took
            // This value is calculated on the server to ensure fairness
            if (roundScore.MatchCount == battle.Grid.Categories.Count)
            {
                roundScore.Time =
                    (DateTimeOffset.UtcNow - battle.RoundStartedAt)
                    + (TimeSpan.FromSeconds(10) * roundScore.Penalties);
            }

            // If all players have matched all categories, end the battle
            if (
                battle.Players.All(x =>
                    x.Scores.ElementAtOrDefault(battle.RoundNumber)?.MatchCount
                    == battle.Grid.Categories.Count
                )
            )
            {
                battle.State = TimerBattleRoom.TimerBattleState.Finished;
            }
        });

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            await ExecuteInBattleAsync(battle =>
            {
                var player = battle.Players.FirstOrDefault(x => x.Name == GetUsername());
                if (player is not null)
                {
                    player.IsActive = false;
                }
            });
        }
        catch (Exception) { }
        await base.OnDisconnectedAsync(exception);
    }

    private async Task<TimerBattleRoom> ExecuteInBattleAsync(Action<TimerBattleRoom> action) =>
        await ExecuteInBattleAsync(GetRoomId(), action);

    private async Task<TimerBattleRoom> ExecuteInBattleAsync(
        string roomId,
        Action<TimerBattleRoom> action
    )
    {
        var battleRoom =
            await dbContext
                .TimerBattleRooms.Include(x => x.Grid)
                .SingleOrDefaultAsync(x => x.RoomId == roomId)
            ?? throw new InvalidOperationException("Room not found");

        action(battleRoom);

        battleRoom.ModifiedDateTime = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        await Clients.Group(roomId).SendAsync("battle-update", battleRoom);

        return battleRoom;
    }

    private string GetRoomId() =>
        Context.Items[ROOM_ID]?.ToString()
        ?? throw new InvalidOperationException("Unexpected error, Room ID not in context");

    private string GetUsername() =>
        Context.Items[USERNAME]?.ToString()
        ?? throw new InvalidOperationException("Unexpected error, Room ID not in context");
}
