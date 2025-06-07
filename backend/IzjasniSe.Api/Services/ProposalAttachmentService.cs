using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class ProposalAttachmentService : IProposalAttachmentService
    {
        private readonly AppDbContext _db;
        private readonly IFileUploadService _fileUploadService;
        private readonly ILogger<ProposalAttachmentService> _logger;

        public ProposalAttachmentService(
            AppDbContext db,
            IFileUploadService fileUploadService,
            ILogger<ProposalAttachmentService> logger)
        {
            _db = db;
            _fileUploadService = fileUploadService;
            _logger = logger;
        }

        public async Task<IEnumerable<ProposalAttachment>> GetByProposalIdAsync(int proposalId)
        {
            return await _db.ProposalAttachments
                .Where(a => a.ProposalId == proposalId)
                .OrderBy(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ProposalAttachment?> GetByIdAsync(int id)
        {
            return await _db.ProposalAttachments
                .Include(a => a.Proposal)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<ProposalAttachment> CreateAsync(ProposalAttachment attachment)
        {
            attachment.CreatedAt = DateTime.UtcNow;
            _db.ProposalAttachments.Add(attachment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Created attachment {AttachmentId} for proposal {ProposalId}",
                attachment.Id, attachment.ProposalId);

            return attachment;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var attachment = await _db.ProposalAttachments.FindAsync(id);
            if (attachment == null) return false;

            // Delete the physical file
            var deleted = await _fileUploadService.DeleteFileAsync(attachment.FilePathOrUrl);
            if (!deleted)
            {
                _logger.LogWarning("Failed to delete physical file for attachment {AttachmentId}", id);
            }

            _db.ProposalAttachments.Remove(attachment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Deleted attachment {AttachmentId}", id);
            return true;
        }
    }
}