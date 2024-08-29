using System.Security.Claims;
using GridBattle.Data;
using Microsoft.AspNetCore.Mvc;

namespace GridBattle.Api;

public static class UserApi
{
    public static WebApplication MapUserApi(this WebApplication app)
    {
        app.MapGet("/api/users/me", GetCurrentUser)
            .WithName("getCurrentUser")
            .WithDescription(
                "Gets the currently logged in user. If they are not registered, registers them."
            )
            .Produces<User>(StatusCodes.Status200OK)
            .WithOpenApi();

        return app;
    }

    private static async Task<IResult> GetCurrentUser(
        [FromServices] GridDbContext dbContext,
        ClaimsPrincipal claims
    )
    {
        var userId = claims.FindFirstValue(ClaimTypes.NameIdentifier);
        var username = claims.FindFirstValue("cognito:username");
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(username))
        {
            return Results.Forbid();
        }

        var user = await dbContext.Users.FindAsync(userId);
        if (user is not null)
            return TypedResults.Ok(user);

        // User does not exist, create them in the system
        var newUser = new User() { UserId = userId, Username = username };
        dbContext.Users.Add(newUser);

        // All users are subscribed to the GLOBAL leaderboard
        var subscription = new LeaderboardSubscription
        {
            LeaderboardId = "GLOBAL",
            IsOwner = false,
            UserId = userId,
            CreatedDateTime = DateTimeOffset.UtcNow,
        };
        dbContext.LeaderboardSubscriptions.Add(subscription);
        await dbContext.SaveChangesAsync();
        return TypedResults.Ok(newUser);
    }
}
