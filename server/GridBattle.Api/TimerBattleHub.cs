using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Data;

public sealed class TimerBattleHub(
    IDbContextFactory<GridDbContext> dbContextFactory,
    ILogger<TimerBattleHub> logger
) : Hub
{
    private const string USERNAME = "USERNAME";
    private const string ROOM_ID = "ROOM_ID";

    public async Task<TimerBattleRoom> CreateBattle(string name)
    {
        name = name.ToUpperInvariant();
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
                    IsHost = true,
                },
            ],
            RoundNumber = 0,
            State = TimerBattleRoom.TimerBattleState.WaitingToStart,
        };
        using var db = dbContextFactory.CreateDbContext();
        db.Add(newBattle);
        await db.SaveChangesAsync();

        await Groups.AddToGroupAsync(Context.ConnectionId, newBattle.RoomId);
        Context.Items[USERNAME] = name;
        Context.Items[ROOM_ID] = newBattle.RoomId;
        logger.LogInformation(
            "{Username} has created a new battle room {RoomId}",
            name,
            newBattle.RoomId
        );

        return newBattle;
    }

    public async Task<TimerBattleRoom> JoinBattle(string roomId, string name)
    {
        name = name.ToUpperInvariant();
        var battle = await ExecuteInBattleAsync(
            roomId,
            battle =>
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
                            IsHost = false,
                        }
                    );
                }
            }
        );

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        Context.Items[USERNAME] = name;
        Context.Items[ROOM_ID] = roomId;

        logger.LogInformation("{Username} has joined battle room {RoomId}", name, roomId);
        return battle;
    }

    public async Task LeaveBattle()
    {
        var roomId = GetRoomId();
        var name = GetUsername();

        var battle = await ExecuteInBattleAsync(
            roomId,
            battle =>
            {
                battle.Players.RemoveAll(x => x.Name == name);
            }
        );

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        Context.Items.Remove(USERNAME);
        Context.Items.Remove(ROOM_ID);
        logger.LogInformation("{Username} has left the battle room {RoomId}", name, roomId);
    }

    public async Task StartBattle(string gridId)
    {
        using var db = dbContextFactory.CreateDbContext();
        var grid =
            await db.Grids.Where(x => x.Id == gridId).SingleOrDefaultAsync()
            ?? throw new InvalidOperationException("Provided Grid not found");

        await ExecuteInBattleAsync(
            db,
            battle =>
            {
                if (battle.State is TimerBattleRoom.TimerBattleState.InProgress)
                {
                    throw new InvalidOperationException("A battle is already in progress");
                }

                battle.GridId = grid.Id;
                battle.RoundStartedAt = DateTimeOffset.UtcNow;
                battle.State = TimerBattleRoom.TimerBattleState.InProgress;
            }
        );
    }

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

            logger.LogInformation(
                "Setting matches to {MatchCount} with {Penalties} penalties for {Username}",
                matchCount,
                penalties,
                player.Name
            );

            var roundScore = EnsurePlayerHasScoreForCurrentRound(battle, player);
            roundScore.MatchCount = matchCount;
            roundScore.Penalties = penalties;
            // If the player has matched all categories, record the time it took
            // This value is calculated on the server to ensure fairness
            if (roundScore.MatchCount == battle.Grid.Categories.Count)
            {
                roundScore.Time =
                    (DateTimeOffset.UtcNow - (battle.RoundStartedAt!.Value))
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
                battle.RoundNumber++;
            }
        });

    public async Task EndRound() =>
        await ExecuteInBattleAsync(battle =>
        {
            if (battle.Grid is null)
                throw new InvalidOperationException("There is no round in progress to end");

            AssertIsHost(battle);

            // Any players that haven't finished have their current time marked as their final
            foreach (var player in battle.Players)
            {
                var roundScore = EnsurePlayerHasScoreForCurrentRound(battle, player);
                var expectedMatches = battle.Grid.Categories.Count;
                if (roundScore.MatchCount < expectedMatches)
                {
                    roundScore.Time =
                        (DateTimeOffset.UtcNow - (battle.RoundStartedAt!.Value))
                        + (TimeSpan.FromSeconds(10) * roundScore.Penalties);
                }
            }

            battle.State = TimerBattleRoom.TimerBattleState.Finished;
            battle.RoundNumber++;
        });

    public async Task MarkPlayerAsDisconnected(string playerToMark) =>
        await ExecuteInBattleAsync(battle =>
        {
            AssertIsHost(battle);
            var player =
                battle.Players.FirstOrDefault(x =>
                    x.Name.Equals(playerToMark, StringComparison.OrdinalIgnoreCase)
                ) ?? throw new InvalidOperationException("Player not found in game");
            player.IsActive = false;
        });

    public async Task KickPlayer(string playerToMark) =>
        await ExecuteInBattleAsync(battle =>
        {
            AssertIsHost(battle);
            battle.Players.RemoveAll(x =>
                x.Name.Equals(playerToMark, StringComparison.OrdinalIgnoreCase)
            );
        });

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var username = Context.Items[USERNAME];
            if (username is not null)
            {
                logger.LogWarning("Player {Username} disconnected", username);
                await ExecuteInBattleAsync(battle =>
                {
                    var player = battle.Players.FirstOrDefault(x => x.Name == GetUsername());
                    if (player is not null)
                    {
                        player.IsActive = false;
                    }
                });
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to mark player as inactive when disconnecting");
        }
        await base.OnDisconnectedAsync(exception);
    }

    private static TimerBattleRoom.RoundScore EnsurePlayerHasScoreForCurrentRound(
        TimerBattleRoom battle,
        TimerBattleRoom.TimerBattlePlayer player
    )
    {
        if (player.Scores.Count <= battle.RoundNumber)
        {
            player.Scores.Add(
                new()
                {
                    MatchCount = 0,
                    Penalties = 0,
                    Time = TimeSpan.Zero,
                }
            );
        }
        return player.Scores[battle.RoundNumber];
    }

    private void AssertIsHost(TimerBattleRoom battle)
    {
        var player =
            battle.Players.FirstOrDefault(x => x.Name == GetUsername())
            ?? throw new InvalidOperationException(
                "Unexpected error: Current player not found in room"
            );
        if (!player.IsHost)
        {
            throw new InvalidOperationException("Only a Host may perform this action");
        }
    }

    private async Task<TimerBattleRoom> ExecuteInBattleAsync(Action<TimerBattleRoom> action)
    {
        using var db = dbContextFactory.CreateDbContext();
        return await ExecuteInBattleAsync(db, GetRoomId(), action);
    }

    private async Task<TimerBattleRoom> ExecuteInBattleAsync(
        GridDbContext db,
        Action<TimerBattleRoom> action
    ) => await ExecuteInBattleAsync(db, GetRoomId(), action);

    private async Task<TimerBattleRoom> ExecuteInBattleAsync(
        string roomId,
        Action<TimerBattleRoom> action
    )
    {
        using var db = dbContextFactory.CreateDbContext();
        return await ExecuteInBattleAsync(db, roomId, action);
    }

    private async Task<TimerBattleRoom> ExecuteInBattleAsync(
        GridDbContext db,
        string roomId,
        Action<TimerBattleRoom> action
    )
    {
        var battleRoom =
            await db
                .TimerBattleRooms.Include(x => x.Grid)
                .SingleOrDefaultAsync(x => x.RoomId == roomId.ToUpperInvariant())
            ?? throw new InvalidOperationException("Room not found");

        action(battleRoom);

        battleRoom.ModifiedDateTime = DateTime.UtcNow;
        db.ChangeTracker.DetectChanges();

        await db.SaveChangesAsync();

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
