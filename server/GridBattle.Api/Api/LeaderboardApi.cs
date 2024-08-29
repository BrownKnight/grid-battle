using System.Security.Claims;
using GridBattle.Data;
using Microsoft.AspNetCore.Mvc;

namespace GridBattle.Api;

public static class LeaderboardApi
{
    public static WebApplication AddLeaderboardApi(this WebApplication app)
    {
        app.MapGet("/api/grids/{gridId}/leaderboards/", GetSubscribedLeaderboards)
            .WithName("getSubscribedLeaderboards")
            .WithDescription("Gets the specified Leaderboard for the specified Grid")
            .Produces<List<Leaderboard>>(StatusCodes.Status200OK)
            .WithOpenApi();

        return app;
    }

    private static IResult GetSubscribedLeaderboards(
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal user
    )
    {
        var username = user.Identity!.Name;
        return Results.Ok();
    }
}
