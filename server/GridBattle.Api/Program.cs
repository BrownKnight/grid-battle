using System.Text.Json.Serialization;
using GridBattle.Api;
using GridBattle.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder
    .Logging.ClearProviders()
    .AddSimpleConsole(opt =>
    {
        opt.IncludeScopes = true;
        opt.UseUtcTimestamp = true;
        opt.TimestampFormat = "yyyy-MM-ddThh:mm:ss.fffZ ";
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
builder.Services.AddDbContextFactory<GridDbContext>(options =>
    options.UseNpgsql(connectionString).EnableDetailedErrors()
);

builder
    .Services.AddSingleton<HubFilter>()
    .AddSignalR(options =>
    {
        options.EnableDetailedErrors = true;
        options.AddFilter<HubFilter>();
    })
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.PayloadSerializerOptions.Converters.Add(new TimeSpanConverter());
    });

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.SerializerOptions.Converters.Add(new TimeSpanConverter());
});

builder.Services.AddHostedService<DataCleanupService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGridApi().MapHub<TimerBattleHub>("/api/timerbattle/signalr");

app.Run();
