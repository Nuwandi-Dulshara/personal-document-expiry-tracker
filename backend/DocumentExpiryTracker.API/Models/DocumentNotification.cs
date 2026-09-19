namespace DocumentExpiryTracker.API.Models;

public class DocumentNotification
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public string? LastReadStatus { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Document Document { get; set; } = null!;
}
