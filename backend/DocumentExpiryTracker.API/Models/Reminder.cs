namespace DocumentExpiryTracker.API.Models;

public class Reminder
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public DateTime ReminderDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Document Document { get; set; } = null!;
}