﻿// <auto-generated />
using System;
using System.Collections.Generic;
using GridBattle.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GridBattle.Data.Importer.Migrations
{
    [DbContext(typeof(GridDbContext))]
    partial class GridDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("GridBattle.Data.Grid", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("varchar(100)")
                        .HasColumnName("NAME");

                    b.Property<string>("CreatedBy")
                        .IsRequired()
                        .HasColumnType("varchar(50)")
                        .HasColumnName("CRTD_BY");

                    b.Property<DateTimeOffset>("CreatedDateTime")
                        .HasColumnType("timestamptz")
                        .HasColumnName("CRTD_TS");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Source")
                        .IsRequired()
                        .HasColumnType("varchar(16)")
                        .HasColumnName("SOURCE");

                    b.HasKey("Id");

                    b.ToTable("GRIDS", (string)null);
                });

            modelBuilder.Entity("GridBattle.Data.Grid", b =>
                {
                    b.OwnsMany("GridBattle.Data.Category", "Categories", b1 =>
                        {
                            b1.Property<string>("GridId")
                                .HasColumnType("varchar(100)");

                            b1.Property<int>("Id")
                                .ValueGeneratedOnAdd()
                                .HasColumnType("integer");

                            b1.Property<List<string>>("Answers")
                                .IsRequired()
                                .HasColumnType("text[]")
                                .HasColumnName("answers");

                            b1.Property<string>("Name")
                                .IsRequired()
                                .HasColumnType("varchar(100)")
                                .HasAnnotation("Relational:JsonPropertyName", "name");

                            b1.HasKey("GridId", "Id");

                            b1.ToTable("GRIDS");

                            b1.ToJson("CATEGORIES");

                            b1.WithOwner()
                                .HasForeignKey("GridId");
                        });

                    b.Navigation("Categories");
                });
#pragma warning restore 612, 618
        }
    }
}
