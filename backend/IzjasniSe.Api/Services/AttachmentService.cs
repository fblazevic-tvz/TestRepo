using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class AttachmentService : IAttachmentService
    {
        private readonly AppDbContext _db;

        public AttachmentService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Attachment>> GetAllAsync()
        {
            return await _db.Attachments
                            .Include(a => a.Suggestion)
                            .AsNoTracking()
                            .ToListAsync();
        }

        public async Task<Attachment?> GetByIdAsync(int id)
        {
            return await _db.Attachments
                            .Include(a => a.Suggestion)
                            .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Attachment> CreateAsync(Attachment attachment)
        {
            attachment.CreatedAt = DateTime.UtcNow;
            _db.Attachments.Add(attachment);
            await _db.SaveChangesAsync();
            return attachment;
        }

        public async Task<bool> UpdateAsync(Attachment attachment)
        {
            var existing = await _db.Attachments.FindAsync(attachment.Id);
            if (existing == null) return false;

            existing.FilePathOrUrl = attachment.FilePathOrUrl;
            existing.FileName = attachment.FileName;
            existing.ContentType = attachment.ContentType;
            existing.FileSize = attachment.FileSize;
            existing.SuggestionId = attachment.SuggestionId;
            existing.UpdatedAt = DateTime.UtcNow;

            _db.Attachments.Update(existing);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Attachments.FindAsync(id);
            if (existing == null) return false;

            _db.Attachments.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
