using IzjasniSe.Api.Dtos;
using IzjasniSe.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NoticeAttachmentsController : ControllerBase
    {
        private readonly INoticeAttachmentService _attachmentService;
        private readonly INoticeService _noticeService;
        private readonly IProposalService _proposalService;
        private readonly ILoggedInService _loggedInService;
        private readonly IWebHostEnvironment _environment;
        private readonly IContentTypeProvider _contentTypeProvider;
        private readonly ILogger<NoticeAttachmentsController> _logger;

        public NoticeAttachmentsController(
            INoticeAttachmentService attachmentService,
            INoticeService noticeService,
            IProposalService proposalService,
            ILoggedInService loggedInService,
            IWebHostEnvironment environment,
            ILogger<NoticeAttachmentsController> logger)
        {
            _attachmentService = attachmentService;
            _noticeService = noticeService;
            _proposalService = proposalService;
            _loggedInService = loggedInService;
            _environment = environment;
            _contentTypeProvider = new FileExtensionContentTypeProvider();
            _logger = logger;
        }

        [HttpGet("notice/{noticeId:int}")]
        public async Task<ActionResult<IEnumerable<AttachmentDto>>> GetByNoticeId(int noticeId)
        {
            var attachments = await _attachmentService.GetByNoticeIdAsync(noticeId);

            var dtos = attachments.Select(a => new AttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                ContentType = a.ContentType,
                FileSize = a.FileSize,
                Description = a.Description,
                FileUrl = $"{Request.Scheme}://{Request.Host}{a.FilePathOrUrl}",
                DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/noticeattachments/{a.Id}/download",
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
                DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/noticeattachments/{attachment.Id}/download",
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
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> Delete(int id)
        {
            var attachment = await _attachmentService.GetByIdAsync(id);
            if (attachment == null)
                return NotFound();

            // Check authorization
            var notice = await _noticeService.GetByIdAsync(attachment.NoticeId);
            if (notice == null)
                return NotFound();

            var currentUserId = _loggedInService.GetCurrentUserId();

            var proposalOfNotice = await _proposalService.GetByIdAsync(notice.ProposalId);
            if (proposalOfNotice == null)
                return NotFound();

            if (proposalOfNotice.ModeratorId != currentUserId)
                return Forbid();

            var deleted = await _attachmentService.DeleteAsync(id);
            if (!deleted)
                return StatusCode(500, "Failed to delete attachment");

            return NoContent();
        }
    }
}
