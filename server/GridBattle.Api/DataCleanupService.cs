using GridBattle.Data;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Api;

public sealed class DataCleanupService(
    IDbContextFactory<GridDbContext> dbContextFactory,
    ILogger<DataCleanupService> logger
) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("DataCleanupService started");

        // Every 10 minutes, check for and delete stale games
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var db = dbContextFactory.CreateDbContext();
                var modifiedBefore = DateTimeOffset.UtcNow.AddHours(-1);
                var staleBattleCount = await db
                    .TimerBattleRooms.Where(x => x.ModifiedDateTime < modifiedBefore)
                    .ExecuteDeleteAsync(stoppingToken);

                if (staleBattleCount > 0)
                {
                    logger.LogWarning("Deleted {Count} TimerBattleRooms", staleBattleCount);
                }
            }
            catch (Exception e)
            {
                logger.LogError(e, "Failed to delete stale games");
            }
        }
    }
}
