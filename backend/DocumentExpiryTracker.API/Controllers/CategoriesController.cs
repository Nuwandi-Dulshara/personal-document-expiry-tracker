using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/categories")]
public class CategoriesController(ICategoryService categories) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponseDto>>> Get() => Ok(await categories.GetAsync());

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> Create([FromBody] CategoryRequestDto request)
    {
        var result = await categories.CreateAsync(request.Name);
        return result.Success ? StatusCode(201, result.Category) : BadRequest(new { message = result.Error });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> Update(int id, [FromBody] CategoryRequestDto request)
    {
        var result = await categories.UpdateAsync(id, request.Name);
        return result.Success ? Ok(result.Category) : result.Error == "Category not found." ? NotFound(new { message = result.Error }) : BadRequest(new { message = result.Error });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await categories.DeleteAsync(id) ? NoContent() : Conflict(new { message = "Move the documents in this category before deleting it." });
}

public record CategoryRequestDto(string Name);