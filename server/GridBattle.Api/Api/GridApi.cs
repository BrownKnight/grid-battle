using System.Security.Claims;
using GridBattle.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Api;

public static class GridApi
{
    public static WebApplication MapGridApi(this WebApplication app)
    {
        app.MapGet("/api/grids", GetGrids)
            .AllowAnonymous()
            .WithName("getGrids")
            .WithDescription("Get grids, paginated and ordered by datetime descending")
            .Produces<List<Grid>>(StatusCodes.Status200OK)
            .WithOpenApi();

        app.MapGet("/api/grids/random", GetRandomGrid)
            .AllowAnonymous()
            .WithName("getRandomGrid")
            .WithDescription("Get a random Grid")
            .Produces<Grid>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithOpenApi();

        app.MapGet("/api/grids/{gridId}", GetGrid)
            .AllowAnonymous()
            .WithName("getGridById")
            .WithDescription("Get a Grid by its ID")
            .Produces<Grid>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithOpenApi();

        app.MapPost("/api/grids", CreateGrid)
            .AllowAnonymous()
            .WithName("createGrid")
            .WithDescription("Create a new Grid")
            .Produces<Grid>(StatusCodes.Status200OK)
            .WithOpenApi();

        return app;
    }

    private static async Task<IResult> GetGrids(
        [FromQuery] int? offset,
        [FromQuery] int? limit,
        [FromQuery] GridSource? source,
        [FromQuery] string? search,
        [FromServices] GridDbContext dbContext
    )
    {
        offset ??= 0;
        limit ??= 20;
        var grids = await dbContext
            .Grids.AsNoTracking()
            .Where(x =>
                (source == null || x.Source == source)
                && (
                    search == null
                    || EF.Functions.ILike(x.Name, $"%{search}%")
                    || EF.Functions.ILike(x.Id, $"%{search}%")
                )
            )
            .OrderByDescending(x => x.CreatedDateTime)
            .ThenBy(x => x.Id)
            .Skip(offset.Value)
            .Take(limit.Value)
            .ToListAsync();

        return TypedResults.Ok(grids);
    }

    private sealed record GetGridDto(
        string Id,
        string Name,
        GridSource Source,
        DateTimeOffset CreatedDateTime,
        string CreatedBy,
        List<Category> Categories,
        LeaderboardEntry? LeaderboardEntry
    );

    private static async Task<IResult> GetGrid(
        [FromRoute] string gridId,
        [FromServices] GridDbContext dbContext
    )
    {
        var grid = await dbContext.Grids.Where(x => x.Id == gridId).FirstOrDefaultAsync();
        return grid is null ? Results.NotFound() : TypedResults.Ok(grid);
    }

    private static async Task<IResult> GetRandomGrid([FromServices] GridDbContext dbContext)
    {
        var grid = await dbContext.Grids.GetRandomAsync();
        return grid is null ? Results.NotFound() : TypedResults.Ok(grid);
    }

    private sealed record CreateGridDto(string Name, string CreatedBy, List<Category> Categories);

    private static async Task<IResult> CreateGrid(
        [FromBody] CreateGridDto createGridDto,
        [FromServices] GridDbContext dbContext
    )
    {
        var newGrid = new Grid
        {
            Id = IdCodeGenerator.GenerateId(8),
            Name = createGridDto.Name,
            CreatedBy = createGridDto.CreatedBy,
            CreatedDateTime = DateTimeOffset.UtcNow,
            Categories = createGridDto.Categories,
            Source = GridSource.Custom,
        };
        dbContext.Add(newGrid);
        await dbContext.SaveChangesAsync();
        return TypedResults.Ok(newGrid);
    }
}
