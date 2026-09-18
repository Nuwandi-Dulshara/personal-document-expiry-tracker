using System.ComponentModel.DataAnnotations;

namespace DocumentExpiryTracker.API.DTOs;

public record RegisterDto([Required, MinLength(2)] string FullName, [Required, EmailAddress] string Email,
    string? Phone, [Required, MinLength(8)] string Password, [Required] string ConfirmPassword);
public record LoginDto([Required, EmailAddress] string Email, [Required] string Password);
public record UserDto(int Id, string FullName, string Email, string? Phone);
public record AuthResponseDto(string Token, UserDto User);
public record CreateDocumentDto([Required] string DocumentName, [Range(1, int.MaxValue)] int CategoryId,
    string? DocumentNumber, string? IssuedBy, DateTime? IssueDate, [Required] DateTime? ExpiryDate,
    DateTime? ReminderDate, string? Description);
public record UpdateDocumentDto([Required] string DocumentName, [Range(1, int.MaxValue)] int CategoryId,
    string? DocumentNumber, string? IssuedBy, DateTime? IssueDate, [Required] DateTime? ExpiryDate,
    DateTime? ReminderDate, string? Description);
public record DocumentResponseDto(int Id, string DocumentName, int CategoryId, string Category, string? DocumentNumber,
    string? IssuedBy, DateTime? IssueDate, DateTime ExpiryDate, DateTime? ReminderDate, string? Description,
    int DaysRemaining, string Status);
public record CategoryResponseDto(int Id, string Name, string? Description);
public record DashboardResponseDto(int TotalDocuments, int ActiveDocuments, int ExpiringSoonDocuments,
    int ExpiredDocuments, IReadOnlyList<DocumentResponseDto> UpcomingExpirations, IReadOnlyList<DocumentResponseDto> RecentDocuments);
public record UpdateProfileDto([Required, MinLength(2)] string FullName, [Required, EmailAddress] string Email, string? Phone);
public record SettingsDto(int ExpiryWarningDays, int DefaultReminderDays, bool EnableReminders);
public record ReminderDto(int Id, int DocumentId, string DocumentName, DateTime ReminderDate, bool IsCompleted);
public record CreateReminderDto([Range(1, int.MaxValue)] int DocumentId, [Required] DateTime? ReminderDate);
public record UpdateReminderDto([Required] DateTime? ReminderDate, bool IsCompleted);