using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/dashboard")]
public class DashboardController(IDashboardService dashboard) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardResponseDto>> Get() => Ok(await dashboard.GetAsync(CurrentUserId));
}