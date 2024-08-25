using System.Net;
using GridBattle.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public static class GridApi
{
    public static WebApplication MapGridApi(this WebApplication app)
    {
        app.MapGet("/api/grids", GetGrids)
            .WithName("getGrids")
            .WithDescription("Get grids, paginated and ordered by datetime descending")
            .Produces<List<Grid>>(StatusCodes.Status200OK)
            .WithOpenApi();

        app.MapGet("/api/grid/{gridId}", GetGrid)
            .WithName("getGridById")
            .WithDescription("Get a Grid by its ID")
            .Produces<Grid>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .WithOpenApi();

        return app;
    }

    private static async Task<IResult> GetGrids(
        [FromQuery] int? offset,
        [FromQuery] int? limit,
        [FromServices] GridDbContext dbContext
    )
    {
        offset ??= 0;
        limit ??= 20;
        var grids = await dbContext
            .Grids.OrderByDescending(x => x.CreatedDateTime)
            .Skip(offset.Value)
            .Take(limit.Value)
            .ToListAsync();

        return TypedResults.Ok(grids);
    }

    private static async Task<IResult> GetGrid(
        [FromRoute] string gridId,
        [FromServices] GridDbContext dbContext
    )
    {
        var grid = await dbContext.Grids.Where(x => x.Id == gridId).FirstOrDefaultAsync();
        return grid is null ? Results.NotFound() : TypedResults.Ok(grid);
    }
}
