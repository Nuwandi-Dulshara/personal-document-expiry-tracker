using System.Security.Claims;
using DocumentExpiryTracker.API.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

var controller = new TestController
{
    ControllerContext = new ControllerContext
    {
        HttpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(
                new[] { new Claim(ClaimTypes.NameIdentifier, "42") }, "Bearer"))
        }
    }
};
if (controller.UserId != 42)
    throw new Exception("Authenticated user ID was not resolved.");
Console.WriteLine("PASS: mapped JWT subject resolves the authenticated user ID.");

sealed class TestController : ApiControllerBase
{
    public int UserId => CurrentUserId;
}
