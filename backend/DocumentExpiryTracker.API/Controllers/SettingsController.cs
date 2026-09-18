using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/settings")]
public class SettingsController(ISettingsService settings) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SettingsDto>> Get() => Ok(await settings.GetAsync(CurrentUserId));
    [HttpPut]
    public async Task<ActionResult<SettingsDto>> Update(SettingsDto request) => Ok(await settings.UpdateAsync(CurrentUserId, request));
}