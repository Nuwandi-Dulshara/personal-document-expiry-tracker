namespace DocumentExpiryTracker.API.Models;

public class Document
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    public string DocumentName { get; set; } = string.Empty;
    public string? DocumentNumber { get; set; }
    public string? IssuedBy { get; set; }
    public DateOnly? IssueDate { get; set; }
    public DateOnly ExpiryDate { get; set; }
    public DateOnly? ReminderDate { get; set; }
    public string? Description { get; set; }
    public string? FilePath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public DocumentCategory Category { get; set; } = null!;
    public ICollection<Reminder> Reminders { get; set; } = new List<Reminder>();
    public DocumentNotification? Notification { get; set; }
}
