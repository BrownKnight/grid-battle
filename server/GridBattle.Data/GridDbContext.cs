using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace GridBattle.Data;

public sealed class GridDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Grid> Grids => Set<Grid>();
    public DbSet<TimerBattleRoom> TimerBattleRooms => Set<TimerBattleRoom>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var grid = modelBuilder.Entity<Grid>().ToTable("GRIDS");
        grid.HasKey(x => x.Id);
        _ = grid.Property(x => x.Id).HasColumnName("ID").HasColumnType("varchar(16)").IsRequired();
        _ = grid.Property(x => x.Name).HasColumnName("NAME").HasColumnType("varchar(100)").IsRequired();
        _ = grid.Property(x => x.Source).HasColumnName("SOURCE").HasColumnType("varchar(16)").IsRequired().HasConversion<string>();
        _ = grid.Property(x => x.CreatedBy).HasColumnName("CRTD_BY").HasColumnType("varchar(50)").IsRequired();
        _ = grid.Property(x => x.CreatedDateTime).HasColumnName("CRTD_TS").HasColumnType("timestamptz").IsRequired();

        grid.OwnsMany(x => x.Categories, b =>
        {
            _ = b.Property(x => x.Name).HasJsonPropertyName("name").HasColumnType("varchar(100)").IsRequired();
            _ = b.Property(x => x.Answers).HasColumnName("answers").HasColumnType("text[]").IsRequired();
            b.ToJson("CATEGORIES");
        });

        var timerBattleRoom = modelBuilder.Entity<TimerBattleRoom>().ToTable("TIMER_BATTLE_ROOM");
        timerBattleRoom.HasKey(x => x.RoomId);
        _ = timerBattleRoom.Property(x => x.RoomId).HasColumnName("ROOM_ID").HasColumnType("varchar(6)").IsRequired();
        _ = timerBattleRoom.Property(x => x.GridId).HasColumnName("GRID_ID").HasColumnType("varchar(16)").IsRequired(false);
        _ = timerBattleRoom.Property(x => x.ModifiedDateTime).HasColumnName("MDFD_TS").HasColumnType("timestamptz").IsRequired().IsConcurrencyToken();
        _ = timerBattleRoom.Property(x => x.RoundStartedAt).HasColumnName("ROUND_START_TS").HasColumnType("timestamptz").IsRequired(false);
        _ = timerBattleRoom.Property(x => x.RoundNumber).HasColumnName("ROUND_NUMBER").HasColumnType("smallint").IsRequired();
        _ = timerBattleRoom.Property(x => x.State).HasColumnName("STATE").HasColumnType("varchar(32)").IsRequired().HasConversion<string>();

        timerBattleRoom.OwnsMany(x => x.Players, b =>
        {
            _ = b.Property(x => x.Name).HasJsonPropertyName("name").IsRequired();
            _ = b.Property(x => x.IsActive).HasJsonPropertyName("isActive").IsRequired();
            // b.Property(x => x.Scores).Metadata.SetValueComparer(new ListValueComparer<TimerBattleRoom.RoundScore>());

            b.OwnsMany(x => x.Scores, score => {
                score.Property(x => x.MatchCount).HasJsonPropertyName("matchCount").IsRequired();
                score.Property(x => x.Penalties).HasJsonPropertyName("penalties").IsRequired();
                score.Property(x => x.Time).HasJsonPropertyName("time").IsRequired();
            });

            b.ToJson("PLAYERS");
        });

        timerBattleRoom.HasOne(x => x.Grid).WithMany().HasForeignKey(x => x.GridId).HasPrincipalKey(x => x.Id);

        base.OnModelCreating(modelBuilder);
    }

    internal class ListValueComparer<T>()
        : ValueComparer<List<T>>(
            (c1, c2) => c1!.SequenceEqual(c2!),
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList()
        );
}