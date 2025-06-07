using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileUploadController : ControllerBase
    {
        private readonly IFileUploadService _fileUploadService;
        private readonly ISuggestionService _suggestionService;
        private readonly IProposalService _proposalService;
        private readonly INoticeService _noticeService;
        private readonly ISuggestionAttachmentService _suggestionAttachmentService;
        private readonly IProposalAttachmentService _proposalAttachmentService;
        private readonly INoticeAttachmentService _noticeAttachmentService;
        private readonly ILoggedInService _loggedInService;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(
            IFileUploadService fileUploadService,
            ISuggestionService suggestionService,
            IProposalService proposalService,
            INoticeService noticeService,
            ISuggestionAttachmentService suggestionAttachmentService,
            IProposalAttachmentService proposalAttachmentService,
            INoticeAttachmentService noticeAttachmentService,
            ILoggedInService loggedInService,
            ILogger<FileUploadController> logger)
        {
            _fileUploadService = fileUploadService;
            _suggestionService = suggestionService;
            _proposalService = proposalService;
            _noticeService = noticeService;
            _suggestionAttachmentService = suggestionAttachmentService;
            _proposalAttachmentService = proposalAttachmentService;
            _noticeAttachmentService = noticeAttachmentService;
            _loggedInService = loggedInService;
            _logger = logger;
        }

        [HttpPost("suggestion/{id}/profile-image")]
        public async Task<IActionResult> UploadSuggestionProfileImage(int id, [FromForm] ProfileImageUploadDto dto)
        {
            var suggestion = await _suggestionService.GetByIdAsync(id);
            if (suggestion == null)
                return NotFound();

            // Check authorization
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (suggestion.AuthorId != currentUserId && !_loggedInService.IsCurrentUserAdminOrModerator())
                return Forbid();

            try
            {
                var imageUrl = await _fileUploadService.UploadProfileImageAsync(dto.ProfileImage, id, "suggestions");

                // Update suggestion with new image URL
                var updateDto = new SuggestionUpdateDto { /* Keep existing values */ };
                await _suggestionService.UpdateProfileImageAsync(id, imageUrl);

                return Ok(new { profileImageUrl = imageUrl });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("proposal/{id}/profile-image")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> UploadProposalProfileImage(int id, [FromForm] ProfileImageUploadDto dto)
        {
            var proposal = await _proposalService.GetByIdAsync(id);
            if (proposal == null)
                return NotFound();

            // Check if current user is the moderator of this proposal
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (proposal.ModeratorId != currentUserId && !_loggedInService.IsCurrentUserAdmin())
                return Forbid();

            try
            {
                var imageUrl = await _fileUploadService.UploadProfileImageAsync(dto.ProfileImage, id, "proposals");
                await _proposalService.UpdateProfileImageAsync(id, imageUrl);

                return Ok(new { profileImageUrl = imageUrl });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("notice/{id}/profile-image")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> UploadNoticeProfileImage(int id, [FromForm] ProfileImageUploadDto dto)
        {
            var notice = await _noticeService.GetByIdAsync(id);
            if (notice == null)
                return NotFound();

            // Check if current user is the moderator of this notice
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (notice.ModeratorId != currentUserId && !_loggedInService.IsCurrentUserAdmin())
                return Forbid();

            try
            {
                var imageUrl = await _fileUploadService.UploadProfileImageAsync(dto.ProfileImage, id, "notices");
                await _noticeService.UpdateProfileImageAsync(id, imageUrl);

                return Ok(new { profileImageUrl = imageUrl });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("suggestion/{id}/attachments")]
        public async Task<IActionResult> UploadSuggestionAttachments(int id, [FromForm] MultipleAttachmentsUploadDto dto)
        {
            var suggestion = await _suggestionService.GetByIdAsync(id);
            if (suggestion == null)
                return NotFound();

            var currentUserId = _loggedInService.GetCurrentUserId();
            if (suggestion.AuthorId != currentUserId)
                return Forbid();

            var uploadedAttachments = new List<AttachmentDto>();

            try
            {
                for (int i = 0; i < dto.Files.Count; i++)
                {
                    var file = dto.Files[i];
                    var description = i < dto.Descriptions.Count ? dto.Descriptions[i] : "";

                    var fileUrl = await _fileUploadService.UploadAttachmentAsync(file, id, "suggestions");

                    var attachment = new SuggestionAttachment
                    {
                        FilePathOrUrl = fileUrl,
                        FileName = file.FileName,
                        ContentType = file.ContentType,
                        FileSize = file.Length,
                        Description = description,
                        SuggestionId = id
                    };

                    var created = await _suggestionAttachmentService.CreateAsync(attachment);
                    uploadedAttachments.Add(new AttachmentDto
                    {
                        Id = created.Id,
                        FileName = created.FileName,
                        ContentType = created.ContentType,
                        FileSize = created.FileSize,
                        FileUrl = $"{Request.Scheme}://{Request.Host}{created.FilePathOrUrl}",
                        DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/suggestionattachments/{created.Id}/download",
                        CreatedAt = created.CreatedAt
                    });
                }

                return Ok(new { attachments = uploadedAttachments });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("proposal/{id}/attachments")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> UploadProposalAttachments(int id, [FromForm] MultipleAttachmentsUploadDto dto)
        {
            var proposal = await _proposalService.GetByIdAsync(id);
            if (proposal == null)
                return NotFound();

            var currentUserId = _loggedInService.GetCurrentUserId();
            if (proposal.ModeratorId != currentUserId)
                return Forbid();

            var uploadedAttachments = new List<AttachmentDto>();

            try
            {
                for (int i = 0; i < dto.Files.Count; i++)
                {
                    var file = dto.Files[i];
                    var description = i < dto.Descriptions.Count ? dto.Descriptions[i] : "";

                    var fileUrl = await _fileUploadService.UploadAttachmentAsync(file, id, "proposals");

                    var attachment = new ProposalAttachment
                    {
                        FilePathOrUrl = fileUrl,
                        FileName = file.FileName,
                        ContentType = file.ContentType,
                        FileSize = file.Length,
                        Description = description,
                        ProposalId = id
                    };

                    var created = await _proposalAttachmentService.CreateAsync(attachment);
                    uploadedAttachments.Add(new AttachmentDto
                    {
                        Id = created.Id,
                        FileName = created.FileName,
                        ContentType = created.ContentType,
                        FileSize = created.FileSize,
                        FileUrl = $"{Request.Scheme}://{Request.Host}{created.FilePathOrUrl}",
                        DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/proposalattachments/{created.Id}/download",
                        CreatedAt = created.CreatedAt
                    });
                }

                return Ok(new { attachments = uploadedAttachments });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("notice/{id}/attachments")]
        [Authorize(Roles = "Moderator,Admin")]
        public async Task<IActionResult> UploadNoticeAttachments(int id, [FromForm] MultipleAttachmentsUploadDto dto)
        {
            var notice = await _noticeService.GetByIdAsync(id);
            if (notice == null)
                return NotFound();

            var currentUserId = _loggedInService.GetCurrentUserId();
            if (notice.ModeratorId != currentUserId)
                return Forbid();

            var uploadedAttachments = new List<AttachmentDto>();

            try
            {
                for (int i = 0; i < dto.Files.Count; i++)
                {
                    var file = dto.Files[i];
                    var description = i < dto.Descriptions.Count ? dto.Descriptions[i] : "";

                    var fileUrl = await _fileUploadService.UploadAttachmentAsync(file, id, "notices");

                    var attachment = new NoticeAttachment
                    {
                        FilePathOrUrl = fileUrl,
                        FileName = file.FileName,
                        ContentType = file.ContentType,
                        FileSize = file.Length,
                        Description = description,
                        NoticeId = id
                    };

                    var created = await _noticeAttachmentService.CreateAsync(attachment);
                    uploadedAttachments.Add(new AttachmentDto
                    {
                        Id = created.Id,
                        FileName = created.FileName,
                        ContentType = created.ContentType,
                        FileSize = created.FileSize,
                        FileUrl = $"{Request.Scheme}://{Request.Host}{created.FilePathOrUrl}",
                        DownloadUrl = $"{Request.Scheme}://{Request.Host}/api/noticeattachments/{created.Id}/download",
                        CreatedAt = created.CreatedAt
                    });
                }

                return Ok(new { attachments = uploadedAttachments });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("file")]
        public async Task<IActionResult> DeleteFile([FromQuery] string filePath)
        {
            // Add proper authorization checks based on file path
            // This is a simplified version - you should verify ownership

            var deleted = await _fileUploadService.DeleteFileAsync(filePath);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}