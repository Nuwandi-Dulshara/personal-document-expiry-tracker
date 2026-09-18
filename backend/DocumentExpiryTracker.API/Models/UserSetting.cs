namespace DocumentExpiryTracker.API.Models;

public class UserSetting
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ExpiryWarningDays { get; set; } = 30;
    public int DefaultReminderDays { get; set; } = 30;
    public bool EnableReminders { get; set; } = true;
    public User User { get; set; } = null!;
}