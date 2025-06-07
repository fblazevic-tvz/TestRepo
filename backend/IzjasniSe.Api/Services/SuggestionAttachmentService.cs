using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class SuggestionAttachmentService : ISuggestionAttachmentService
    {
        private readonly AppDbContext _db;
        private readonly IFileUploadService _fileUploadService;
        private readonly ILogger<SuggestionAttachmentService> _logger;

        public SuggestionAttachmentService(
            AppDbContext db,
            IFileUploadService fileUploadService,
            ILogger<SuggestionAttachmentService> logger)
        {
            _db = db;
            _fileUploadService = fileUploadService;
            _logger = logger;
        }

        public async Task<IEnumerable<SuggestionAttachment>> GetBySuggestionIdAsync(int suggestionId)
        {
            return await _db.SuggestionAttachments
                .Where(a => a.SuggestionId == suggestionId)
                .OrderBy(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<SuggestionAttachment?> GetByIdAsync(int id)
        {
            return await _db.SuggestionAttachments
                .Include(a => a.Suggestion)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<SuggestionAttachment> CreateAsync(SuggestionAttachment attachment)
        {
            attachment.CreatedAt = DateTime.UtcNow;
            _db.SuggestionAttachments.Add(attachment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Created attachment {AttachmentId} for suggestion {SuggestionId}",
                attachment.Id, attachment.SuggestionId);

            return attachment;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var attachment = await _db.SuggestionAttachments.FindAsync(id);
            if (attachment == null) return false;

            // Delete the physical file
            var deleted = await _fileUploadService.DeleteFileAsync(attachment.FilePathOrUrl);
            if (!deleted)
            {
                _logger.LogWarning("Failed to delete physical file for attachment {AttachmentId}", id);
            }

            _db.SuggestionAttachments.Remove(attachment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Deleted attachment {AttachmentId}", id);
            return true;
        }
    }
}