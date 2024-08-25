using System.Net.Http.Json;
using System.Text.Json.Nodes;
using GridBattle.Data;
using Microsoft.EntityFrameworkCore;

var connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
var dbOptions = new DbContextOptionsBuilder()
    .EnableDetailedErrors()
    .EnableSensitiveDataLogging()
    .UseNpgsql(connectionString)
    .Options;
var db = new GridDbContext(dbOptions);

if (args.Contains("--delete")) {
    Console.WriteLine("Deleting Database as --delete argument provided");
    await db.Database.EnsureDeletedAsync();
}

if (args.Contains("--migrate")) {
    Console.WriteLine("Applying latest DB migrations");
    await db.Database.MigrateAsync();
}

Console.WriteLine("DB Connected and Created");

Console.WriteLine("Importing NYT Connections Puzzles");

var lastNytImportGrid = await db
    .Grids.Where(x => x.Source == GridSource.NYT)
    .OrderBy(x => x.CreatedDateTime)
    .LastOrDefaultAsync();

// If no data exists, start at the first ever puzzle (2023-06-12)
var lastNytImportDate =
    lastNytImportGrid?.CreatedDateTime.Date
    ?? new DateTimeOffset(2023, 06, 12, 0, 0, 0, TimeSpan.Zero).Date;
var fromDate = DateOnly.FromDateTime(lastNytImportDate);
var toDate = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);

var httpClient = new HttpClient();
var count = 0;
while (fromDate < toDate)
{
    Console.WriteLine($"Fetching puzzle for {fromDate:yyyy-MM-dd}");
    var response = await httpClient.GetFromJsonAsync<JsonObject>(
        $"https://www.nytimes.com/svc/connections/v2/{fromDate:yyyy-MM-dd}.json"
    )!;
    var newGrid = new Grid
    {
        Id = $"NYT{response!["id"]}",
        Name = $"NYT {response!["id"]}",
        Source = GridSource.NYT,
        CreatedBy = "NYT Connections",
        CreatedDateTime = DateTimeOffset.UtcNow,
        Categories = response["categories"]!
            .AsArray()
            .Select(x => new Category
            {
                Name = x!["title"]!.ToString()!,
                Answers = x["cards"]!.AsArray().Select(a => a!["content"]!.ToString()).ToList()!,
            })
            .ToList(),
    };
    db.Add(newGrid);
    count++;
    fromDate = fromDate.AddDays(1);

    // Avoid spamming the NYT API too quickly
    await Task.Delay(500);
}

Console.WriteLine($"Adding {count} new grids");
await db.SaveChangesAsync();

Console.WriteLine("Import Complete");
