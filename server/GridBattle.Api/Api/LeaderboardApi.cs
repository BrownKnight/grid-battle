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

        app.MapGet("/api/users/me/leaderboards", GetLeaderboards)
            .WithName("getLeaderboards")
            .WithDescription("Gets all the subscribed leaderboards")
            .Produces<List<Dto.Leaderboard.Get>>(StatusCodes.Status200OK)
            .Produces<List<Dto.Leaderboard.Get>>(StatusCodes.Status404NotFound)
            .WithOpenApi();

        app.MapGet(
                "/api/grids/{gridId}/leaderboards/{leaderboardId}/entries",
                GetLeaderboardEntries
            )
            .WithName("getLeaderboardEntries")
            .WithDescription(
                "Gets all the relevant leaderboard entries for the specified leaderboard"
            )
            .Produces<List<Dto.Leaderboard.GetEntry>>(StatusCodes.Status200OK)
            .Produces<List<Dto.Leaderboard.GetEntry>>(StatusCodes.Status404NotFound)
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

    private static async Task<IResult> GetLeaderboards(
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal user
    )
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        // Unauthenticated users just get the GLOBAL leaderboard
        var leaderboards = userId is null
            ? await dbContext.Leaderboards.Where(x => x.LeaderboardId == "GLOBAL").ToListAsync()
            : await dbContext
                .LeaderboardSubscriptions.AsNoTracking()
                .Include(x => x.Leaderboard)
                .Where(x => x.UserId == userId)
                .Select(x => x.Leaderboard!)
                .OrderByDescending(x => x!.CreatedDateTime)
                .ToListAsync();

        return Results.Ok(
            leaderboards.Select(x => new Dto.Leaderboard.Get(x!.LeaderboardId, x.Name)).ToList()
        );
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
            .Include(x => x.User)
            .Where(x => x.GridId == gridId && subscribers.Contains(x.UserId))
            .OrderBy(x => x.TotalTime)
            .Skip(offset.Value)
            .Take(limit.Value)
            .ToListAsync();

        return Results.Ok(
            entries.Select(x => new Dto.Leaderboard.GetEntry(
                x.UserId,
                x.User!.Username,
                x.CreatedDateTime,
                x.TotalTime,
                x.Penalties
            ))
        );
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
        var username = user.FindFirstValue("cognito:username");
        if (userId is null || username is null)
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

        return Results.Ok(
            new Dto.Leaderboard.GetEntry(
                userId,
                username,
                newEntry.CreatedDateTime,
                newEntry.TotalTime,
                newEntry.Penalties
            )
        );
    }
}
