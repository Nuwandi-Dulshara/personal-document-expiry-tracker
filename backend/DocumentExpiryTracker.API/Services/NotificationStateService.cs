using DocumentExpiryTracker.API.Data;
using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using DocumentExpiryTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DocumentExpiryTracker.API.Services;

public sealed class NotificationStateService(ApplicationDbContext db) : INotificationStateService
{
    private static readonly HashSet<string> ValidStatuses =
        ["ReminderActive", "ExpiresToday", "Expired"];

    public async Task<IReadOnlyList<NotificationStateDto>> GetAsync(int userId) =>
        await db.DocumentNotifications.AsNoTracking()
            .Where(x => x.Document.UserId == userId)
            .Select(x => new NotificationStateDto(x.DocumentId, x.LastReadStatus))
            .ToListAsync();

    public async Task<(bool Success, string? Error)> MarkReadAsync(
        int userId, MarkNotificationsReadDto request)
    {
        var entries = request.Notifications
            .GroupBy(x => x.DocumentId)
            .Select(x => x.Last())
            .ToList();
        if (entries.Any(x => !ValidStatuses.Contains(x.Status)))
            return (false, "Invalid notification status.");
        if (entries.Count == 0) return (true, null);

        var ids = entries.Select(x => x.DocumentId).ToList();
        var ownedIds = await db.Documents
            .Where(x => x.UserId == userId && ids.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync();
        if (ownedIds.Count != ids.Count) return (false, "Notification document not found.");

        var existing = await db.DocumentNotifications
            .Where(x => ids.Contains(x.DocumentId))
            .ToDictionaryAsync(x => x.DocumentId);
        foreach (var entry in entries)
        {
            if (!existing.TryGetValue(entry.DocumentId, out var state))
            {
                state = new DocumentNotification { DocumentId = entry.DocumentId };
                db.DocumentNotifications.Add(state);
            }
            state.LastReadStatus = entry.Status;
            state.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
        return (true, null);
    }
}
