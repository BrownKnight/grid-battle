using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GridBattle.Data;

public sealed record TimerBattleRoom
{
    public required string RoomId { get; set; }

    public string? GridId { get; set; }

    public Grid? Grid { get; set; }

    public required TimerBattleState State { get; set; }

    public required DateTimeOffset ModifiedDateTime { get; set; }

    public required int RoundNumber { get; set; }

    public DateTimeOffset? RoundStartedAt { get; set; }

    public required List<TimerBattlePlayer> Players { get; set; }

    public enum TimerBattleState
    {
        WaitingToStart,
        InProgress,
        Finished,
    }

    public sealed record TimerBattlePlayer
    {
        public required string Name { get; set; }
        public required List<RoundScore> Scores { get; set; }
        public required bool IsActive { get; set; }
    }

    public sealed record RoundScore
    {
        public TimeSpan? Time { get; set; }
        public required int MatchCount { get; set; }
        public required int Penalties { get; set; }
    }
}
