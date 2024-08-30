using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Data;

public static class GridDbContextExtensions
{
    public static async Task<Grid> GetRandomAsync(this IQueryable<Grid> grids)
    {
        var count = await grids.CountAsync();
        var randomIndex = RandomNumberGenerator.GetInt32(count - 1);
        return await grids
            .Where(x => x.Source != GridSource.Test)
            .OrderBy(x => x.Id)
            .Skip(randomIndex)
            .FirstAsync();
    }
}
