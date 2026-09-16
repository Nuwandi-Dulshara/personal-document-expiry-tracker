using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/categories")]
public class CategoriesController(ICategoryService categories) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponseDto>>> Get() => Ok(await categories.GetAsync());
}