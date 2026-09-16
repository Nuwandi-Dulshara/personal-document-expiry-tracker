using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DocumentExpiryTracker.API.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseMySql("Server=localhost;Port=3306;Database=document_expiry_tracker;User=root;Password=change-me;",
                new MySqlServerVersion(new Version(8, 0, 0)))
            .Options;
        return new ApplicationDbContext(options);
    }
}