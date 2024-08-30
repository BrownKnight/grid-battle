namespace GridBattle.Api.Dto.Leaderboard;

public sealed record GetEntry(
    string UserId,
    string Username,
    DateTimeOffset CreatedDateTime,
    TimeSpan TotalTime,
    int Penalties
);
