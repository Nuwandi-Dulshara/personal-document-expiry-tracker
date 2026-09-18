using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DocumentExpiryTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDatabaseIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "DocumentName",
                table: "Documents",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "DocumentCategories",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc));

            migrationBuilder.CreateIndex(
                name: "IX_Documents_DocumentName",
                table: "Documents",
                column: "DocumentName");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ExpiryDate",
                table: "Documents",
                column: "ExpiryDate");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentCategories_Name",
                table: "DocumentCategories",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Documents_DocumentName",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ExpiryDate",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_DocumentCategories_Name",
                table: "DocumentCategories");

            migrationBuilder.AlterColumn<string>(
                name: "DocumentName",
                table: "Documents",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "DocumentCategories",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(2552));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3356));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3358));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3359));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3360));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3361));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3362));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3363));

            migrationBuilder.UpdateData(
                table: "DocumentCategories",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 9, 16, 9, 24, 18, 764, DateTimeKind.Utc).AddTicks(3363));
        }
    }
}
