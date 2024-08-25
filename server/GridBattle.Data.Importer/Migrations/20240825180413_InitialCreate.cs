using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GridBattle.Data.Importer.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GRIDS",
                columns: table => new
                {
                    NAME = table.Column<string>(type: "varchar(100)", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    SOURCE = table.Column<string>(type: "varchar(16)", nullable: false),
                    CRTD_TS = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    CRTD_BY = table.Column<string>(type: "varchar(50)", nullable: false),
                    CATEGORIES = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GRIDS", x => x.NAME);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GRIDS");
        }
    }
}
