using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

namespace GridBattle.Data;

public sealed class GridDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<Grid> Grids => Set<Grid>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var grid = modelBuilder.Entity<Grid>().ToTable("GRIDS");
        _ = grid.Property(x => x.Id).HasColumnName("ID").HasColumnType("varchar(16)").IsRequired();
        _ = grid.Property(x => x.Source).HasColumnName("SOURCE").HasColumnType("varchar(16)").IsRequired().HasConversion<string>();
        _ = grid.Property(x => x.CreatedBy).HasColumnName("CRTD_BY").HasColumnType("varchar(50)").IsRequired();
        _ = grid.Property(x => x.CreatedDateTime).HasColumnName("CRTD_TS").HasColumnType("timestamptz").IsRequired();
        // _ = grid.Property(x => x.Categories).HasColumnName("CATEGORIES");

        grid.OwnsMany(x => x.Categories, b =>
        {
            _ = b.Property(x => x.Name).HasJsonPropertyName("name").HasColumnType("varchar(100)").IsRequired();
            _ = b.Property(x => x.Answers).HasColumnName("answers").HasColumnType("text[]").IsRequired();
            b.ToJson("CATEGORIES");
        });

        base.OnModelCreating(modelBuilder);
    }
}