using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto request) { var result = await auth.RegisterAsync(request); return result.Success ? StatusCode(201, result.Response) : Conflict(new { message = result.Error }); }
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto request) { var result = await auth.LoginAsync(request); return result.Success ? Ok(result.Response) : Unauthorized(new { message = "Invalid email or password." }); }
}