using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GridBattle.Data.Importer;

public class DesignDbContextFactory : IDesignTimeDbContextFactory<GridDbContext>
{
    public GridDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
        var dbOptions = new DbContextOptionsBuilder()
            .EnableDetailedErrors()
            .EnableSensitiveDataLogging()
            .UseNpgsql(connectionString, opt => opt.MigrationsAssembly("GridBattle.Data.Importer"))
            .Options;
        return new GridDbContext(dbOptions);
    }
}
