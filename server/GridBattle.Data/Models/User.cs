namespace GridBattle.Data;

public sealed record User
{
    public required string UserId { get; set; }
    public required string Username { get; set; }
    public List<LeaderboardSubscription> LeaderboardSubscriptions { get; set; } = [];
}
