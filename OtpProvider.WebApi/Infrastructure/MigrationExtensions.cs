using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.Data;

namespace OtpProvider.WebApi.Infrastructure
{
    public static class MigrationExtensions
    {
        /// <summary>
        /// Applies pending EF Core migrations if configuration key Ef:AutoMigrate = true.
        /// Fail-fast on error (preferred for correctness).
        /// </summary>
        public static IHost ApplyMigrations(this IHost host)
        {
            using var scope = host.Services.CreateScope();
            var cfg = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            if (!cfg.GetValue<bool>("Ef:AutoMigrate"))
                return host;

            var logger = scope.ServiceProvider
                .GetService<ILoggerFactory>()?
                .CreateLogger("EfMigration");

            try
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var strategy = db.Database.CreateExecutionStrategy();
                strategy.Execute(() =>
                {
                    logger?.LogInformation("Applying EF Core migrations...");
                    db.Database.Migrate();
                    logger?.LogInformation("Migrations applied.");
                });
            }
            catch (Exception ex)
            {
                logger?.LogCritical(ex, "EF Core migrations failed.");
                throw;
            }

            return host;
        }
    }
}