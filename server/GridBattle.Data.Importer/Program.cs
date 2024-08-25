using System.Net.Http.Json;
using System.Text.Json.Nodes;
using GridBattle.Data;
using Microsoft.EntityFrameworkCore;

Console.WriteLine("Importing NYT Connections Puzzles");

var connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
var dbOptions = new DbContextOptionsBuilder()
    .EnableDetailedErrors()
    .EnableSensitiveDataLogging()
    .UseNpgsql(connectionString)
    .Options;
var db = new GridDbContext(dbOptions);

await db.Database.EnsureCreatedAsync();

Console.WriteLine("DB Connected and Created");

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
while (fromDate < toDate)
{
    Console.WriteLine($"Fetching puzzle for {fromDate:yyyy-MM-dd}");
    var response = await httpClient.GetFromJsonAsync<JsonObject>(
        $"https://www.nytimes.com/svc/connections/v2/{fromDate:yyyy-MM-dd}.json"
    )!;
    var newGrid = new Grid
    {
        Id = response!["id"]!.ToString(),
        Source = GridSource.NYT,
        CreatedBy = "ImportAutomation",
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
    fromDate = fromDate.AddDays(1);

    // Avoid spamming the NYT API too quickly
    await Task.Delay(500);
}

Console.WriteLine($"Adding {db.ChangeTracker.Entries().Count()} new grids");
await db.SaveChangesAsync();

Console.WriteLine("Import Complete");
