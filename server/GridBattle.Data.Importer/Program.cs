using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using GridBattle.Data;
using Microsoft.EntityFrameworkCore;

Console.WriteLine($"----------------");
Console.WriteLine($"Running Importer on {DateTimeOffset.UtcNow}");

var serializerOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web)
{
    Converters = { new JsonStringEnumConverter() },
};

var connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
var dbOptions = new DbContextOptionsBuilder()
    .EnableDetailedErrors()
    .EnableSensitiveDataLogging()
    .UseNpgsql(connectionString)
    .Options;

using (var db = new GridDbContext(dbOptions))
{
    if (args.Contains("--delete"))
    {
        Console.WriteLine("Deleting Database as --delete argument provided");
        await db.Database.EnsureDeletedAsync();
    }

    if (args.Contains("--migrate"))
    {
        Console.WriteLine("Applying latest DB migrations as --migrate argument provided");
        await db.Database.MigrateAsync();
    }

    if (args.Contains("--create"))
    {
        Console.WriteLine("Creating DB as --create argument provided");
        await db.Database.EnsureCreatedAsync();
    }
}

Console.WriteLine("DB Connected and Created");

Console.WriteLine("Importing test data");

using (var testDb = new GridDbContext(dbOptions))
{
    if (!await testDb.Grids.AnyAsync(x => x.Id == "TESTABCD"))
    {
        testDb.Grids.Add(
            new()
            {
                Id = "TESTABCD",
                Name = "Test Grid ABCD",
                Source = GridSource.Test,
                CreatedBy = "Validation",
                CreatedDateTime = DateTimeOffset.UtcNow,
                Categories =
                [
                    new() { Name = "A", Answers = ["A1", "A2", "A3", "A4"] },
                    new() { Name = "B", Answers = ["B1", "B2", "B3", "B4"] },
                    new() { Name = "C", Answers = ["C1", "C2", "C3", "C4"] },
                    new() { Name = "D", Answers = ["D1", "D2", "D3", "D4"] },
                ],
            }
        );
        Console.WriteLine("Added test grid TESTABCD");
    }
    await testDb.SaveChangesAsync();
}

Console.WriteLine("Setting up global leaderboard");

using (var leaderboardDb = new GridDbContext(dbOptions))
{
    if (!await leaderboardDb.Leaderboards.AnyAsync(x => x.LeaderboardId == "GLOBAL"))
    {
        leaderboardDb.Leaderboards.Add(
            new()
            {
                LeaderboardId = "GLOBAL",
                Name = "Global Leaderboard",
                CreatedDateTime = DateTimeOffset.UtcNow,
            }
        );
        Console.WriteLine("Added leaderboard GLOBAL");
    }
    await leaderboardDb.SaveChangesAsync();
}

Console.WriteLine("Importing NYT Connections Puzzles");

using (var nytDbContext = new GridDbContext(dbOptions))
{
    var lastNytImportGrid = await nytDbContext
        .Grids.Where(x => x.Source == GridSource.NYT)
        .OrderBy(x => x.CreatedDateTime)
        .LastOrDefaultAsync();

    // If no data exists, start at the first ever puzzle (2023-06-12)
    var lastNytImportDate =
        lastNytImportGrid?.CreatedDateTime.Date
        ?? new DateTimeOffset(2023, 06, 12, 0, 0, 0, TimeSpan.Zero).Date;

    // If doing a minimal import, and theres no data for the last 30 days, then only load the last 30 days
    var fromDate =
        args.Contains("--minimal") && lastNytImportDate < DateTime.UtcNow.AddDays(-30)
            ? DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-29)
            : DateOnly.FromDateTime(lastNytImportDate).AddDays(1);
    var toDate = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);

    var httpClient = new HttpClient();
    var count = 0;
    while (fromDate <= toDate)
    {
        Console.WriteLine($"Fetching puzzle for {fromDate:yyyy-MM-dd}");
        var response = await httpClient.GetFromJsonAsync<JsonObject>(
            $"https://www.nytimes.com/svc/connections/v2/{fromDate:yyyy-MM-dd}.json"
        )!;
        var newGrid = new Grid
        {
            Id = $"NYT{response!["id"]}",
            Name = $"NYT ({response!["print_date"]})",
            Source = GridSource.NYT,
            CreatedBy = "NYT Connections",
            CreatedDateTime = DateTimeOffset.Parse(
                response!["print_date"]?.ToString() ?? DateTimeOffset.UtcNow.ToString(),
                styles: DateTimeStyles.AssumeUniversal
            ),
            Categories = response["categories"]!
                .AsArray()
                .Select(x => new Category
                {
                    Name = x!["title"]!.ToString()!,
                    Answers = x["cards"]!
                        .AsArray()
                        .Select(a => a!["content"]!.ToString())
                        .ToList()!,
                })
                .ToList(),
        };
        Console.WriteLine($"Adding new Grid {newGrid}");
        nytDbContext.Add(newGrid);
        count++;
        fromDate = fromDate.AddDays(1);

        // Avoid spamming the NYT API too quickly
        await Task.Delay(500);
    }

    Console.WriteLine($"Adding {count} new grids");
    await nytDbContext.SaveChangesAsync();
}

Console.WriteLine("Importing AI generated grids");
using (var dbContext = new GridDbContext(dbOptions))
{
    var existingAIGridIds = await dbContext
        .Grids.Where(x => x.Source == GridSource.AI)
        .Select(x => x.Id)
        .ToListAsync();
    var gridsToImportText = await File.ReadAllTextAsync("AIGeneratedGrids.json");
    var gridsToImport = JsonSerializer.Deserialize<List<Grid>>(
        gridsToImportText,
        serializerOptions
    )!;

    var newGrids = gridsToImport.ExceptBy(existingAIGridIds, x => x.Id);
    dbContext.Grids.AddRange(newGrids);

    Console.WriteLine($"Adding {newGrids.Count()} new AI generated grids");

    await dbContext.SaveChangesAsync();
}

Console.WriteLine("Import Complete");
Console.WriteLine($"----------------");
