using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Data;

public static class GridDbContextExtensions
{
    public static async Task<Grid> GetRandomAsync(this IQueryable<Grid> grids)
    {
        var count = await grids.CountAsync();
        var randomIndex = RandomNumberGenerator.GetInt32(count);
        return await grids.OrderBy(x => x.Id).Skip(randomIndex).FirstAsync();
    }
}
