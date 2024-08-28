namespace GridBattle.Data;

public sealed record Leaderboard
{
    public required string LeaderboardId { get; set; }
    public required string Name { get; set; }
    public required DateTimeOffset CreatedDateTime { get; set; }
    public List<LeaderboardSubscription> Subscribers { get; set; } = [];
}

public sealed record LeaderboardSubscription
{
    public required string LeaderboardId { get; set; }
    public required string UserId { get; set; }
    public required DateTimeOffset CreatedDateTime { get; set; }
    public required bool IsOwner { get; set; }
    public Leaderboard? Leaderboard { get; set; }
}

public sealed record LeaderboardEntry
{
    public required string LeaderboardEntryId { get; set; }
    public required DateTimeOffset CreatedDateTime { get; set; }
    public required string UserId { get; set; }
    public required string GridId { get; set; }
    public required TimeSpan TotalTime { get; set; }
    public required int Penalties { get; set; }
}
