using System.Text.Json.Serialization;
using GridBattle.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = Environment.GetEnvironmentVariable("POSTGRES_URL");
builder.Services.AddDbContextFactory<GridDbContext>(options =>
    options.UseNpgsql(connectionString).EnableDetailedErrors()
);

builder
    .Services.AddSignalR(opt =>
    {
        opt.EnableDetailedErrors = true;
    })
    .AddJsonProtocol(opt =>
        opt.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter())
    );

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter())
);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGridApi().MapHub<TimerBattleHub>("/api/timerbattle/signalr");

app.Run();
