using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/profile")]
public class ProfileController(IProfileService profile) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserDto>> Get() => (await profile.GetAsync(CurrentUserId)) is { } result ? Ok(result) : NotFound();
    [HttpPut]
    public async Task<ActionResult<UserDto>> Update(UpdateProfileDto request) { var result = await profile.UpdateAsync(CurrentUserId, request); return result.Success ? Ok(result.User) : Conflict(new { message = result.Error }); }
}