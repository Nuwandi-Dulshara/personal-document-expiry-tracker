using DocumentExpiryTracker.API.DTOs;

namespace DocumentExpiryTracker.API.Interfaces;

public interface IAuthService { Task<(bool Success, string? Error, AuthResponseDto? Response)> RegisterAsync(RegisterDto request); Task<(bool Success, AuthResponseDto? Response)> LoginAsync(LoginDto request); }
public interface IExpiryService { (string Status, int DaysRemaining) Calculate(DateTime expiryDate, DateTime? today = null); }
public interface IDocumentService { Task<IReadOnlyList<DocumentResponseDto>> GetAsync(int userId, string? search, string? status, int? categoryId, string? sortBy, string? sortDirection); Task<DocumentResponseDto?> GetByIdAsync(int userId, int id); Task<(bool Success, string? Error, DocumentResponseDto? Document)> CreateAsync(int userId, CreateDocumentDto request); Task<(bool Success, string? Error, DocumentResponseDto? Document)> UpdateAsync(int userId, int id, UpdateDocumentDto request); Task<bool> DeleteAsync(int userId, int id); }
public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponseDto>> GetAsync();
    Task<(bool Success, string? Error, CategoryResponseDto? Category)> CreateAsync(string name);
    Task<(bool Success, string? Error, CategoryResponseDto? Category)> UpdateAsync(int id, string name);
    Task<bool> DeleteAsync(int id);
}
public interface IDashboardService { Task<DashboardResponseDto> GetAsync(int userId); }
public interface IProfileService { Task<UserDto?> GetAsync(int userId); Task<(bool Success, string? Error, UserDto? User)> UpdateAsync(int userId, UpdateProfileDto request); }
public interface ISettingsService { Task<SettingsDto> GetAsync(int userId); Task<SettingsDto> UpdateAsync(int userId, SettingsDto request); }
public interface IReminderService { Task<IReadOnlyList<ReminderDto>> GetAsync(int userId); Task<(bool Success, string? Error, ReminderDto? Reminder)> CreateAsync(int userId, CreateReminderDto request); Task<bool> UpdateAsync(int userId, int id, UpdateReminderDto request); Task<bool> DeleteAsync(int userId, int id); }