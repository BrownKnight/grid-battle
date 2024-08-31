using System.ComponentModel.DataAnnotations;
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

        app.MapPost("/api/leaderboards", CreateLeaderboard)
            .WithName("createLeaderboard")
            .WithDescription("Creates a new leaderboard")
            .Produces<Leaderboard>(StatusCodes.Status200OK)
            .WithOpenApi();

        app.MapPost("/api/leaderboards/{leaderboardId}", JoinLeaderboard)
            .WithName("joinLeaderboard")
            .WithDescription("Joins an existing leaderboard")
            .Produces<List<Dto.Leaderboard.Get>>(StatusCodes.Status200OK)
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

        return entry is not null ? TypedResults.Ok(entry) : Results.NotFound();
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
                .OrderBy(x => x!.CreatedDateTime)
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

        // check for an existing entry, and return it
        var existing = await dbContext
            .LeaderboardEntries.Where(x => x.GridId == gridId && x.UserId == userId)
            .FirstOrDefaultAsync();

        if (existing is not null)
        {
            return TypedResults.Ok(existing);
        }

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

    private sealed record CreateLeaderboardDto(string Name);

    private static async Task<IResult> CreateLeaderboard(
        [FromBody] CreateLeaderboardDto request,
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal user
    )
    {
        RequestValidationException.AssertAtLeast(request.Name, 4);

        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Results.Forbid();

        var newLeaderboard = new Leaderboard
        {
            LeaderboardId = IdCodeGenerator.GenerateId(6),
            CreatedDateTime = DateTimeOffset.UtcNow,
            Name = request.Name,
        };

        dbContext.Leaderboards.Add(newLeaderboard);

        var newSubscription = new LeaderboardSubscription
        {
            LeaderboardId = newLeaderboard.LeaderboardId,
            UserId = userId,
            CreatedDateTime = DateTimeOffset.UtcNow,
            IsOwner = true,
        };
        dbContext.LeaderboardSubscriptions.Add(newSubscription);

        await dbContext.SaveChangesAsync();

        return Results.Ok(
            new Dto.Leaderboard.Get(newLeaderboard.LeaderboardId, newLeaderboard.Name)
        );
    }

    private static async Task<IResult> JoinLeaderboard(
        [FromRoute] string leaderboardId,
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal user
    )
    {
        RequestValidationException.AssertExactly(leaderboardId, 6);

        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null)
            return Results.Forbid();

        var newSubscription = new LeaderboardSubscription
        {
            LeaderboardId = leaderboardId,
            UserId = userId,
            CreatedDateTime = DateTimeOffset.UtcNow,
            IsOwner = true,
        };

        dbContext.LeaderboardSubscriptions.Add(newSubscription);

        await dbContext.SaveChangesAsync();

        var subscribedLeaderboards = GetLeaderboards(dbContext, user);

        return Results.Ok(subscribedLeaderboards);
    }
}
