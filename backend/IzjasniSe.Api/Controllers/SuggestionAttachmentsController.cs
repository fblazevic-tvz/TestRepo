using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuggestionAttachmentsController : ControllerBase
    {
        private readonly ISuggestionAttachmentService _attachmentService;
        private readonly ISuggestionService _suggestionService;
        private readonly ILoggedInService _loggedInService;
        private readonly IWebHostEnvironment _environment;
        private readonly IContentTypeProvider _contentTypeProvider;
        private readonly ILogger<SuggestionAttachmentsController> _logger;

        public SuggestionAttachmentsController(
            ISuggestionAttachmentService attachmentService,
            ISuggestionService suggestionService,
            ILoggedInService loggedInService,
            IWebHostEnvironment environment,
            ILogger<SuggestionAttachmentsController> logger)
        {
            _attachmentService = attachmentService;
            _suggestionService = suggestionService;
            _loggedInService = loggedInService;
            _environment = environment;
            _contentTypeProvider = new FileExtensionContentTypeProvider();
            _logger = logger;
        }

        [HttpGet("suggestion/{suggestionId:int}")]
        public async Task<ActionResult<IEnumerable<AttachmentDto>>> GetBySuggestionId(int suggestionId)
        {
            var attachments = await _attachmentService.GetBySuggestionIdAsync(suggestionId);

            var dtos = attachments.Select(a => new AttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                ContentType = a.ContentType,
                FileSize = a.FileSize,
                Description = a.Description,
                FileUrl = $"{Request.Scheme}://{Request.Host}{a.FilePathOrUrl}",
                DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/suggestionattachments/{a.Id}/download",
                CreatedAt = a.CreatedAt
            });

            return Ok(dtos);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<AttachmentDto>> GetById(int id)
        {
            var attachment = await _attachmentService.GetByIdAsync(id);
            if (attachment == null)
                return NotFound();

            var dto = new AttachmentDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                ContentType = attachment.ContentType,
                FileSize = attachment.FileSize,
                Description = attachment.Description,
                FileUrl = $"{Request.Scheme}://{Request.Host}{attachment.FilePathOrUrl}",
                DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/suggestionattachments/{attachment.Id}/download",
                CreatedAt = attachment.CreatedAt
            };

            return Ok(dto);
        }

        [HttpGet("{id:int}/download")]
        public async Task<IActionResult> DownloadAttachment(int id)
        {
            var attachment = await _attachmentService.GetByIdAsync(id);
            if (attachment == null)
            {
                _logger.LogWarning("Attachment {Id} not found for download", id);
                return NotFound();
            }

            var filePath = Path.Combine(_environment.WebRootPath, attachment.FilePathOrUrl.TrimStart('/'));

            if (!System.IO.File.Exists(filePath))
            {
                _logger.LogError("File not found on disk: {FilePath}", filePath);
                return NotFound("File not found on server");
            }

            if (!_contentTypeProvider.TryGetContentType(filePath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(fileBytes, contentType, attachment.FileName);
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var attachment = await _attachmentService.GetByIdAsync(id);
            if (attachment == null)
                return NotFound();

            // Check authorization
            var suggestion = await _suggestionService.GetByIdAsync(attachment.SuggestionId);
            if (suggestion == null)
                return NotFound();

            var currentUserId = _loggedInService.GetCurrentUserId();
            if (suggestion.AuthorId != currentUserId)
                return Forbid();

            var deleted = await _attachmentService.DeleteAsync(id);
            if (!deleted)
                return StatusCode(500, "Failed to delete attachment");

            return NoContent();
        }
    }
}