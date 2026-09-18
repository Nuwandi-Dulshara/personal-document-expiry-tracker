using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DocumentExpiryTracker.API.Data;
using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using DocumentExpiryTracker.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DocumentExpiryTracker.API.Services;

public class ExpiryService : IExpiryService
{
    public (string Status, int DaysRemaining) Calculate(DateTime expiryDate, DateTime? today = null)
    {
        var days = (expiryDate.Date - (today ?? DateTime.UtcNow).Date).Days;
        return (days < 0 ? "expired" : days <= 30 ? "expiring" : "active", days);
    }
}

public class AuthService(ApplicationDbContext db, IConfiguration configuration) : IAuthService
{
    private readonly PasswordHasher<User> passwordHasher = new();

    public async Task<(bool Success, string? Error, AuthResponseDto? Response)> RegisterAsync(RegisterDto request)
    {
        if (request.Password != request.ConfirmPassword) return (false, "Passwords do not match.", null);
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email)) return (false, "Email already registered.", null);
        var user = new User { FullName = request.FullName.Trim(), Email = email, Phone = request.Phone?.Trim() };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        user.Settings = new UserSetting();
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return (true, null, new AuthResponseDto(CreateToken(user), ToDto(user)));
    }

    public async Task<(bool Success, AuthResponseDto? Response)> LoginAsync(LoginDto request)
    {
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == request.Email.Trim().ToLowerInvariant());
        if (user is null || passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            return (false, null);
        return (true, new AuthResponseDto(CreateToken(user), ToDto(user)));
    }

    private string CreateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), new Claim(JwtRegisteredClaimNames.Email, user.Email) };
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(configuration["Jwt:Issuer"], configuration["Jwt:Audience"], claims,
            expires: DateTime.UtcNow.AddMinutes(configuration.GetValue("Jwt:ExpiryMinutes", 60)), signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    internal static UserDto ToDto(User user) => new(user.Id, user.FullName, user.Email, user.Phone);
}

public class DocumentService(ApplicationDbContext db, IExpiryService expiry) : IDocumentService
{
    public async Task<IReadOnlyList<DocumentResponseDto>> GetAsync(int userId, string? search, string? status, int? categoryId, string? sortBy, string? sortDirection)
    {
        var query = db.Documents.AsNoTracking().Include(x => x.Category).Where(x => x.UserId == userId);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => (x.DocumentName + " " + x.DocumentNumber + " " + x.IssuedBy).Contains(search));
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId);
        var documents = await query.ToListAsync();
        var normalizedStatus = status?.Trim().ToLowerInvariant() switch
        {
            "expiring-soon" => "expiring",
            "expired" => "expired",
            "active" => "active",
            "expiring" => "expiring",
            _ => status?.Trim().ToLowerInvariant()
        };
        var response = documents.Select(ToDto).Where(x => string.IsNullOrWhiteSpace(normalizedStatus) || x.Status == normalizedStatus);
        return (sortBy?.ToLowerInvariant(), sortDirection?.ToLowerInvariant()) switch
        {
            ("expirydate", "desc") => response.OrderByDescending(x => x.ExpiryDate).ToList(),
            ("issuedate", "desc") => response.OrderByDescending(x => x.IssueDate).ToList(),
            ("documentname", "desc") => response.OrderByDescending(x => x.DocumentName).ToList(),
            ("createdat", "desc") => documents.OrderByDescending(x => x.CreatedAt).Select(ToDto).ToList(),
            ("issuedate", _) => response.OrderBy(x => x.IssueDate).ToList(),
            ("documentname", _) => response.OrderBy(x => x.DocumentName).ToList(),
            ("createdat", _) => documents.OrderBy(x => x.CreatedAt).Select(ToDto).ToList(),
            _ => response.OrderBy(x => x.ExpiryDate).ToList()
        };
    }

    public async Task<DocumentResponseDto?> GetByIdAsync(int userId, int id) => (await db.Documents.AsNoTracking().Include(x => x.Category).SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId)) is { } document ? ToDto(document) : null;

    public async Task<(bool Success, string? Error, DocumentResponseDto? Document)> CreateAsync(int userId, CreateDocumentDto request)
    {
        var error = await Validate(request.CategoryId, request.IssueDate, request.ExpiryDate, request.ReminderDate);
        if (error is not null) return (false, error, null);
        var document = new Document { UserId = userId, CategoryId = request.CategoryId, DocumentName = request.DocumentName.Trim(), DocumentNumber = request.DocumentNumber?.Trim(), IssuedBy = request.IssuedBy?.Trim(), IssueDate = request.IssueDate, ExpiryDate = request.ExpiryDate!.Value, ReminderDate = request.ReminderDate, Description = request.Description?.Trim() };
        db.Documents.Add(document);
        await db.SaveChangesAsync();
        await db.Entry(document).Reference(x => x.Category).LoadAsync();
        return (true, null, ToDto(document));
    }

    public async Task<(bool Success, string? Error, DocumentResponseDto? Document)> UpdateAsync(int userId, int id, UpdateDocumentDto request)
    {
        var document = await db.Documents.Include(x => x.Category).SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (document is null) return (false, "Document not found.", null);
        var error = await Validate(request.CategoryId, request.IssueDate, request.ExpiryDate, request.ReminderDate);
        if (error is not null) return (false, error, null);
        document.CategoryId = request.CategoryId; document.DocumentName = request.DocumentName.Trim(); document.DocumentNumber = request.DocumentNumber?.Trim(); document.IssuedBy = request.IssuedBy?.Trim(); document.IssueDate = request.IssueDate; document.ExpiryDate = request.ExpiryDate!.Value; document.ReminderDate = request.ReminderDate; document.Description = request.Description?.Trim(); document.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        await db.Entry(document).Reference(x => x.Category).LoadAsync();
        return (true, null, ToDto(document));
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var document = await db.Documents.SingleOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (document is null) return false;
        db.Documents.Remove(document); await db.SaveChangesAsync(); return true;
    }

    private async Task<string?> Validate(int categoryId, DateTime? issueDate, DateTime? expiryDate, DateTime? reminderDate)
    {
        if (!await db.DocumentCategories.AnyAsync(x => x.Id == categoryId)) return "Invalid category.";
        if (!expiryDate.HasValue) return "Expiry date is required.";
        if (issueDate.HasValue && expiryDate.Value.Date < issueDate.Value.Date) return "Expiry date cannot be before issue date.";
        if (reminderDate.HasValue && reminderDate.Value.Date > expiryDate.Value.Date) return "Reminder date cannot be after expiry date.";
        return null;
    }

    private DocumentResponseDto ToDto(Document document)
    {
        var state = expiry.Calculate(document.ExpiryDate);
        return new(document.Id, document.DocumentName, document.CategoryId, document.Category.Name, document.DocumentNumber, document.IssuedBy, document.IssueDate, document.ExpiryDate, document.ReminderDate, document.Description, state.DaysRemaining, state.Status);
    }
}

public class CategoryService(ApplicationDbContext db) : ICategoryService
{
    public async Task<IReadOnlyList<CategoryResponseDto>> GetAsync() => await db.DocumentCategories.AsNoTracking().OrderBy(x => x.Name).Select(x => new CategoryResponseDto(x.Id, x.Name, x.Description)).ToListAsync();
}

public class DashboardService(IDocumentService documents) : IDashboardService
{
    public async Task<DashboardResponseDto> GetAsync(int userId)
    {
        var all = await documents.GetAsync(userId, null, null, null, "expiryDate", "asc");
        return new(all.Count, all.Count(x => x.Status == "active"), all.Count(x => x.Status == "expiring"), all.Count(x => x.Status == "expired"), all.Where(x => x.Status == "expiring").Take(5).ToList(), all.OrderByDescending(x => x.Id).Take(5).ToList());
    }
}

public class ProfileService(ApplicationDbContext db) : IProfileService
{
    public async Task<UserDto?> GetAsync(int userId) => await db.Users.AsNoTracking().Where(x => x.Id == userId).Select(x => new UserDto(x.Id, x.FullName, x.Email, x.Phone)).SingleOrDefaultAsync();
    public async Task<(bool Success, string? Error, UserDto? User)> UpdateAsync(int userId, UpdateProfileDto request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email && x.Id != userId)) return (false, "Email already registered.", null);
        var user = await db.Users.FindAsync(userId); if (user is null) return (false, "User not found.", null);
        user.FullName = request.FullName.Trim(); user.Email = email; user.Phone = request.Phone?.Trim(); user.UpdatedAt = DateTime.UtcNow; await db.SaveChangesAsync();
        return (true, null, AuthService.ToDto(user));
    }
}

public class SettingsService(ApplicationDbContext db) : ISettingsService
{
    public async Task<SettingsDto> GetAsync(int userId) { var settings = await GetEntity(userId); return new(settings.ExpiryWarningDays, settings.DefaultReminderDays, settings.EnableReminders); }
    public async Task<SettingsDto> UpdateAsync(int userId, SettingsDto request) { var settings = await GetEntity(userId); settings.ExpiryWarningDays = Math.Clamp(request.ExpiryWarningDays, 1, 365); settings.DefaultReminderDays = Math.Clamp(request.DefaultReminderDays, 1, 365); settings.EnableReminders = request.EnableReminders; await db.SaveChangesAsync(); return new(settings.ExpiryWarningDays, settings.DefaultReminderDays, settings.EnableReminders); }
    private async Task<UserSetting> GetEntity(int userId) { var settings = await db.UserSettings.SingleOrDefaultAsync(x => x.UserId == userId); if (settings is not null) return settings; settings = new UserSetting { UserId = userId }; db.UserSettings.Add(settings); await db.SaveChangesAsync(); return settings; }
}

public class ReminderService(ApplicationDbContext db) : IReminderService
{
    public async Task<IReadOnlyList<ReminderDto>> GetAsync(int userId) => await db.Reminders.AsNoTracking().Include(x => x.Document).Where(x => x.Document.UserId == userId).OrderBy(x => x.ReminderDate).Select(x => new ReminderDto(x.Id, x.DocumentId, x.Document.DocumentName, x.ReminderDate, x.IsCompleted)).ToListAsync();
    public async Task<(bool Success, string? Error, ReminderDto? Reminder)> CreateAsync(int userId, CreateReminderDto request)
    {
        var document = await db.Documents.SingleOrDefaultAsync(x => x.Id == request.DocumentId && x.UserId == userId); if (document is null) return (false, "Document not found.", null); if (request.ReminderDate > document.ExpiryDate) return (false, "Reminder date cannot be after expiry date.", null);
        var reminder = new Reminder { DocumentId = document.Id, ReminderDate = request.ReminderDate!.Value }; db.Reminders.Add(reminder); await db.SaveChangesAsync(); return (true, null, new(reminder.Id, document.Id, document.DocumentName, reminder.ReminderDate, reminder.IsCompleted));
    }
    public async Task<bool> UpdateAsync(int userId, int id, UpdateReminderDto request) { var reminder = await db.Reminders.Include(x => x.Document).SingleOrDefaultAsync(x => x.Id == id && x.Document.UserId == userId); if (reminder is null || request.ReminderDate > reminder.Document.ExpiryDate) return false; reminder.ReminderDate = request.ReminderDate!.Value; reminder.IsCompleted = request.IsCompleted; await db.SaveChangesAsync(); return true; }
    public async Task<bool> DeleteAsync(int userId, int id) { var reminder = await db.Reminders.Include(x => x.Document).SingleOrDefaultAsync(x => x.Id == id && x.Document.UserId == userId); if (reminder is null) return false; db.Reminders.Remove(reminder); await db.SaveChangesAsync(); return true; }
}