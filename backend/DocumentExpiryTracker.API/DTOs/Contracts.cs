using System.ComponentModel.DataAnnotations;

namespace DocumentExpiryTracker.API.DTOs;

public record RegisterDto([Required, MinLength(2)] string FullName, [Required, EmailAddress] string Email,
    string? Phone, [Required, MinLength(8)] string Password, [Required] string ConfirmPassword);
public record LoginDto([Required, EmailAddress] string Email, [Required] string Password);
public record UserDto(int Id, string FullName, string Email, string? Phone);
public record AuthResponseDto(string Token, UserDto User);
public record CreateDocumentDto([Required] string DocumentName, [Range(1, int.MaxValue)] int CategoryId,
    string? DocumentNumber, string? IssuedBy, DateOnly? IssueDate, [Required] DateOnly? ExpiryDate,
    DateOnly? ReminderDate, string? Description);
public record UpdateDocumentDto([Required] string DocumentName, [Range(1, int.MaxValue)] int CategoryId,
    string? DocumentNumber, string? IssuedBy, DateOnly? IssueDate, [Required] DateOnly? ExpiryDate,
    DateOnly? ReminderDate, string? Description);
public record DocumentResponseDto(int Id, string DocumentName, int CategoryId, string Category, string? DocumentNumber,
    string? IssuedBy, DateOnly? IssueDate, DateOnly ExpiryDate, DateOnly? ReminderDate, string? Description,
    int DaysRemaining, string Status);
public record CategoryResponseDto(int Id, string Name, string? Description);
public record DashboardResponseDto(int TotalDocuments, int ActiveDocuments, int ExpiringSoonDocuments,
    int ExpiredDocuments, IReadOnlyList<DocumentResponseDto> UpcomingExpirations, IReadOnlyList<DocumentResponseDto> RecentDocuments);
public record UpdateProfileDto([Required, MinLength(2)] string FullName, [Required, EmailAddress] string Email, string? Phone);
public record SettingsDto(int ExpiryWarningDays, int DefaultReminderDays, bool EnableReminders);
public record ReminderDto(int Id, int DocumentId, string DocumentName, DateTime ReminderDate, DateOnly ExpiryDate, bool IsCompleted);
public record CreateReminderDto([Range(1, int.MaxValue)] int DocumentId, [Required] DateTime? ReminderDate);
public record UpdateReminderDto([Required] DateTime? ReminderDate, bool IsCompleted);
public record NotificationStateDto(int DocumentId, string? LastReadStatus);
public record MarkNotificationReadDto([Range(1, int.MaxValue)] int DocumentId, [Required] string Status);
public record MarkNotificationsReadDto([Required] IReadOnlyList<MarkNotificationReadDto> Notifications);
