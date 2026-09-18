using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DocumentExpiryTracker.API.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var connectionString = "Server=localhost;Port=3306;Database=document_expiry_tracker;User=root;Password=;SslMode=None;";
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
            .Options;
        return new ApplicationDbContext(options);
    }
}