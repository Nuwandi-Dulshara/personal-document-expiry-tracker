using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/reminders")]
public class RemindersController(IReminderService reminders) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ReminderDto>>> Get() => Ok(await reminders.GetAsync(CurrentUserId));
    [HttpPost]
    public async Task<ActionResult<ReminderDto>> Create(CreateReminderDto request) { var result = await reminders.CreateAsync(CurrentUserId, request); return result.Success ? StatusCode(201, result.Reminder) : BadRequest(new { message = result.Error }); }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateReminderDto request) => await reminders.UpdateAsync(CurrentUserId, id, request) ? NoContent() : NotFound(new { message = "Reminder not found or invalid." });
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await reminders.DeleteAsync(CurrentUserId, id) ? NoContent() : NotFound(new { message = "Reminder not found." });
}