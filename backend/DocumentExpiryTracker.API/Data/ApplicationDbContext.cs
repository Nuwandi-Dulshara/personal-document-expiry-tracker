using DocumentExpiryTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DocumentExpiryTracker.API.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    private static readonly DateTime SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public DbSet<User> Users => Set<User>();
    public DbSet<DocumentCategory> DocumentCategories => Set<DocumentCategory>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<UserSetting> UserSettings => Set<UserSetting>();
    public DbSet<Reminder> Reminders => Set<Reminder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<User>().Property(x => x.Email).HasMaxLength(320).IsRequired();
        modelBuilder.Entity<DocumentCategory>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<Document>().HasIndex(x => x.UserId);
        modelBuilder.Entity<Document>().HasIndex(x => x.CategoryId);
        modelBuilder.Entity<Document>().HasIndex(x => x.ExpiryDate);
        modelBuilder.Entity<Document>().HasIndex(x => x.DocumentName);
        modelBuilder.Entity<User>().HasOne(x => x.Settings).WithOne(x => x.User)
            .HasForeignKey<UserSetting>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Document>().HasOne(x => x.User).WithMany(x => x.Documents)
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<Document>().HasOne(x => x.Category).WithMany(x => x.Documents)
            .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Reminder>().HasOne(x => x.Document).WithMany(x => x.Reminders)
            .HasForeignKey(x => x.DocumentId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DocumentCategory>().HasData(
            new DocumentCategory { Id = 1, Name = "Passport", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 2, Name = "Driving Licence", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 3, Name = "Insurance", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 4, Name = "Certificate", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 5, Name = "Vehicle Document", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 6, Name = "Professional Licence", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 7, Name = "Warranty", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 8, Name = "Membership", CreatedAt = SeedCreatedAt },
            new DocumentCategory { Id = 9, Name = "Other", CreatedAt = SeedCreatedAt });
    }
}