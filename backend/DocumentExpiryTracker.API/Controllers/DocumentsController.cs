using DocumentExpiryTracker.API.DTOs;
using DocumentExpiryTracker.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace DocumentExpiryTracker.API.Controllers;

[Route("api/documents")]
public class DocumentsController(IDocumentService documents) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DocumentResponseDto>>> Get(string? search, string? status, int? categoryId, string? sortBy, string? sortDirection) => Ok(await documents.GetAsync(CurrentUserId, search, status, categoryId, sortBy, sortDirection));
    [HttpGet("{id:int}")]
    public async Task<ActionResult<DocumentResponseDto>> GetById(int id) => (await documents.GetByIdAsync(CurrentUserId, id)) is { } result ? Ok(result) : NotFound(new { message = "Document not found." });
    [HttpPost]
    public async Task<ActionResult<DocumentResponseDto>> Create(CreateDocumentDto request) { var result = await documents.CreateAsync(CurrentUserId, request); return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Document!.Id }, result.Document) : BadRequest(new { message = result.Error }); }
    [HttpPut("{id:int}")]
    public async Task<ActionResult<DocumentResponseDto>> Update(int id, UpdateDocumentDto request) { var result = await documents.UpdateAsync(CurrentUserId, id, request); return result.Success ? Ok(result.Document) : result.Error == "Document not found." ? NotFound(new { message = result.Error }) : BadRequest(new { message = result.Error }); }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) => await documents.DeleteAsync(CurrentUserId, id) ? NoContent() : NotFound(new { message = "Document not found." });
}