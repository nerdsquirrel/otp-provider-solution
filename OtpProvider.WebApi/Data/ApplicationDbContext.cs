using Microsoft.EntityFrameworkCore;

namespace OtpProvider.WebApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Entities.ApplicationUser> Users { get; set; }
        public DbSet<Entities.ApplicationRole> Roles { get; set; }
        public DbSet<Entities.ApplicationUserRoles> UserRoles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Entities.ApplicationUser>(entity =>
            {
                entity.Property(u => u.UserName)
                      .IsRequired()
                      .HasMaxLength(25);

                entity.Property(u => u.Email)
                      .IsRequired();

                entity.Property(u => u.PasswordHash)
                      .IsRequired();

                entity.HasIndex(u => u.UserName)
                      .IsUnique();
            });

            // Roles
            modelBuilder.Entity<Entities.ApplicationRole>(entity =>
            {
                entity.Property(r => r.Name)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.HasIndex(r => r.Name)
                      .IsUnique();
            });

            // UserRoles (join table)
            modelBuilder.Entity<Entities.ApplicationUserRoles>(entity =>
            {
                // Composite PK prevents duplicate (UserId, RoleId) pairs
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });

                // FKs referencing Users(Id) and Roles(Id)
                entity.HasOne(ur => ur.User)
                      .WithMany(u => u.UserRoles)
                      .HasForeignKey(ur => ur.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(ur => ur.Role)
                      .WithMany(r => r.UserRoles)
                      .HasForeignKey(ur => ur.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
