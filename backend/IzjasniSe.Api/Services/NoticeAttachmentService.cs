using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class NoticeAttachmentService : INoticeAttachmentService
    {
        private readonly AppDbContext _db;
        private readonly IFileUploadService _fileUploadService;
        private readonly ILogger<NoticeAttachmentService> _logger;

        public NoticeAttachmentService(
            AppDbContext db,
            IFileUploadService fileUploadService,
            ILogger<NoticeAttachmentService> logger)
        {
            _db = db;
            _fileUploadService = fileUploadService;
            _logger = logger;
        }

        public async Task<IEnumerable<NoticeAttachment>> GetByNoticeIdAsync(int noticeId)
        {
            return await _db.NoticeAttachments
                .Where(a => a.NoticeId == noticeId)
                .OrderBy(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<NoticeAttachment?> GetByIdAsync(int id)
        {
            return await _db.NoticeAttachments
                .Include(a => a.Notice)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<NoticeAttachment> CreateAsync(NoticeAttachment attachment)
        {
            attachment.CreatedAt = DateTime.UtcNow;
            _db.NoticeAttachments.Add(attachment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Created attachment {AttachmentId} for notice {NoticeId}",
                attachment.Id, attachment.NoticeId);

            return attachment;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var attachment = await _db.NoticeAttachments.FindAsync(id);
            if (attachment == null) return false;

            // Delete the physical file
            var deleted = await _fileUploadService.DeleteFileAsync(attachment.FilePathOrUrl);
            if (!deleted)
            {
                _logger.LogWarning("Failed to delete physical file for attachment {AttachmentId}", id);
            }

            _db.NoticeAttachments.Remove(attachment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Deleted attachment {AttachmentId}", id);
            return true;
        }
    }
}