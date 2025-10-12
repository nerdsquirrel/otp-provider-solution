using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OtpProvider.WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPreferenceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserOtpPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    OtpLength = table.Column<int>(type: "int", nullable: false),
                    CharacterSet = table.Column<int>(type: "int", nullable: false),
                    ExpirationSeconds = table.Column<int>(type: "int", nullable: false),
                    MaxVerificationAttempts = table.Column<int>(type: "int", nullable: false),
                    RetryDelaySeconds = table.Column<int>(type: "int", nullable: false),
                    PreferredChannel = table.Column<int>(type: "int", nullable: false),
                    PreferredProviderId = table.Column<int>(type: "int", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOtpPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserOtpPreferences_OtpProviders_PreferredProviderId",
                        column: x => x.PreferredProviderId,
                        principalTable: "OtpProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOtpPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserOtpPreferences_PreferredProviderId",
                table: "UserOtpPreferences",
                column: "PreferredProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOtpPreferences_UserId",
                table: "UserOtpPreferences",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserOtpPreferences");
        }
    }
}
