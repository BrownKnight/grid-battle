using GridBattle.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Api;

public sealed record StatsDto(string Version, int GridCount, int TimerBattleCount);

public static class StatsApi
{
    public static WebApplication MapStatsApi(this WebApplication app)
    {
        app.MapGet("/api/stats", GetStats);
        return app;
    }

    private static async Task<IResult> GetStats([FromServices] GridDbContext dbContext)
    {
        var version = ThisAssembly.AssemblyInformationalVersion;
        var gridCount = await dbContext.Grids.CountAsync();
        var timerBattleCount = await dbContext.TimerBattleRooms.CountAsync();
        return TypedResults.Ok(new StatsDto(version, gridCount, timerBattleCount));
    }
}
