using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/notifications")]
public sealed class NotificationsController(INotificationStateService notifications) : ApiControllerBase
{
    [HttpGet("state")]
    public async Task<ActionResult<IReadOnlyList<NotificationStateDto>>> GetState() =>
        Ok(await notifications.GetAsync(CurrentUserId));

    [HttpPut("read")]
    public async Task<IActionResult> MarkRead(MarkNotificationsReadDto request)
    {
        var result = await notifications.MarkReadAsync(CurrentUserId, request);
        return result.Success ? NoContent() :
            result.Error == "Notification document not found."
                ? NotFound(new { message = result.Error })
                : BadRequest(new { message = result.Error });
    }
}
