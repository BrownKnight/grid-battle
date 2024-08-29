using System.Security.Claims;
using GridBattle.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Api;

public static class LeaderboardApi
{
    public static WebApplication MapLeaderboardApi(this WebApplication app)
    {
        app.MapGet("/api/grids/{gridId}/leaderboards/entries/me", GetMyLeaderboardEntryForGrid)
            .WithName("getMyLeaderboardEntryForGrid")
            .WithDescription("Gets the current users leaderboard entry for the specified grid")
            .Produces<LeaderboardEntry>(StatusCodes.Status200OK)
            .Produces<LeaderboardEntry>(StatusCodes.Status404NotFound)
            .WithOpenApi();

        app.MapPost("/api/grids/{gridId}/leaderboards/entries", CreateLeaderboardEntry)
            .WithName("createLeaderboardEntry")
            .WithDescription("Creates a new leaderboard entry for the specified grid")
            .Produces<LeaderboardEntry>(StatusCodes.Status200OK)
            .WithOpenApi();

        app.MapGet(
                "/api/grids/{gridId}/leaderboards/{leaderboardId}/entries",
                GetLeaderboardEntries
            )
            .WithName("getLeaderboardEntries")
            .WithDescription(
                "Gets all the relevant leaderboard entries for the specified leaderboard"
            )
            .Produces<List<LeaderboardEntry>>(StatusCodes.Status200OK)
            .Produces<List<LeaderboardEntry>>(StatusCodes.Status404NotFound)
            .WithOpenApi();

        return app;
    }

    private static async Task<IResult> GetMyLeaderboardEntryForGrid(
        [FromRoute] string gridId,
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal user
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Results.Forbid();

        var entry = await dbContext.LeaderboardEntries.FirstOrDefaultAsync(x =>
            x.UserId == userId && x.GridId == gridId
        );

        return Results.Ok(entry);
    }

    private static async Task<IResult> GetLeaderboardEntries(
        [FromRoute] string gridId,
        [FromRoute] string leaderboardId,
        [FromQuery] int? offset,
        [FromQuery] int? limit,
        [FromServices] GridDbContext dbContext
    )
    {
        offset ??= 0;
        limit ??= 20;
        var subscribers = dbContext
            .LeaderboardSubscriptions.Where(x => x.LeaderboardId == leaderboardId)
            .Select(x => x.UserId);

        var entries = await dbContext
            .LeaderboardEntries.AsNoTracking()
            .Where(x => x.GridId == gridId && subscribers.Contains(x.UserId))
            .OrderByDescending(x => x.CreatedDateTime)
            .Skip(offset.Value)
            .Take(limit.Value)
            .ToListAsync();

        return Results.Ok(entries);
    }

    private sealed record CreateLeaderboardEntryDto(TimeSpan TotalTime, int Penalties);

    private static async Task<IResult> CreateLeaderboardEntry(
        [FromRoute] string gridId,
        [FromBody] CreateLeaderboardEntryDto request,
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal user
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Results.Forbid();

        var newEntry = new LeaderboardEntry
        {
            GridId = gridId,
            UserId = userId,
            CreatedDateTime = DateTimeOffset.UtcNow,
            Penalties = request.Penalties,
            TotalTime = request.TotalTime,
        };

        dbContext.LeaderboardEntries.Add(newEntry);

        await dbContext.SaveChangesAsync();
        return Results.Ok(newEntry);
    }
}
