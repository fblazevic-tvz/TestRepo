using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;

namespace IzjasniSe.Api.Services
{
    public class NoticeService : INoticeService
    {
        private readonly AppDbContext _db;
        private readonly IProposalService _proposalsService;
        private readonly ILoggedInService _loggedInService;
        private readonly IFileUploadService _fileUploadService;

        public NoticeService(AppDbContext db, IProposalService proposalsService, ILoggedInService loggedInService, IFileUploadService fileUploadService)
        {
            _db = db;
            _proposalsService = proposalsService;
            _loggedInService = loggedInService;
            _fileUploadService = fileUploadService;
        }

        public async Task<IEnumerable<Notice>> GetAllAsync()
        {
            return await _db.Notices
                            .Include(n => n.Proposal)
                            .Include(n => n.Moderator)
                            .AsNoTracking()
                            .ToListAsync();
        }

        public async Task<Notice?> GetByIdAsync(int id)
        {
            return await _db.Notices
                            .Include(n => n.Proposal)
                                .ThenInclude(p => p.City)
                            .Include(n => n.Proposal)
                                .ThenInclude(p => p.Moderator)
                            .Include(n => n.Moderator)
                            .FirstOrDefaultAsync(n => n.Id == id);
        }

        public async Task<IEnumerable<Notice>> GetByProposalIdAsync(int proposalId)
        {
            return await _db.Notices
                .Where(n => n.ProposalId == proposalId)
                .Include(p => p.Proposal)
                .Include(n => n.Moderator)
                .OrderByDescending(n => n.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
       
        }

        public async Task<Notice?> CreateAsync(NoticeCreateDto noticeCreateDto)
        {
            bool isValid = true;
            var foundProposal = await _proposalsService.GetByIdAsync(noticeCreateDto.ProposalId);
            
            if (foundProposal == null)
            {
                isValid = false;
            }

            if (!noticeCreateDto.ModeratorId.Equals(foundProposal?.ModeratorId))
            {
                isValid = false;
            }

            if (isValid)
            {
                var currentUserId = _loggedInService.GetCurrentUserId();
                if (currentUserId == noticeCreateDto.ModeratorId)
                {
                    var entity = new Notice
                    {
                        Title = noticeCreateDto.Title,
                        Content = noticeCreateDto.Content,
                        ProposalId = noticeCreateDto.ProposalId,
                        ModeratorId = noticeCreateDto.ModeratorId,
                        CreatedAt = DateTime.UtcNow,
                    };

                    _db.Notices.Add(entity);
                    await _db.SaveChangesAsync();
                    return entity;

                }
            }

            return null;
           
        }

        public async Task<bool> UpdateAsync(int id, NoticeUpdateDto noticeUpdateDto)
        {
            var existingNotice = await GetByIdAsync(id);

            if (existingNotice == null)
                return false;

            var currentUserId = _loggedInService.GetCurrentUserId();
            if (currentUserId == existingNotice.ModeratorId)
            {
                if (noticeUpdateDto.Title != null)
                    existingNotice.Title = noticeUpdateDto.Title;

                if (noticeUpdateDto.Content != null)
                    existingNotice.Content = noticeUpdateDto.Content;

                existingNotice.UpdatedAt = DateTime.UtcNow;

                _db.Notices.Update(existingNotice);
                await _db.SaveChangesAsync();
                return true;
            }
            return false;
                
        }

        public async Task<bool> DeleteAsync(int id)
        {

            var existing = await _db.Notices.FindAsync(id);
            if (existing == null) return false;

            var currentUserId = _loggedInService.GetCurrentUserId();
            if(currentUserId == existing.ModeratorId)
            {
                _db.Notices.Remove(existing);
                await _db.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> UpdateProfileImageAsync(int id, string profileImageUrl)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (currentUserId == null)
                return false;

            var notice = await _db.Notices.FindAsync(id);
            if (notice == null)
                return false;

            // Check if user is the moderator or admin
            if (notice.ModeratorId != currentUserId)
                return false;

            if (!string.IsNullOrEmpty(notice.ProfileImageUrl))
            {
                await _fileUploadService.DeleteFileAsync(notice.ProfileImageUrl);
            }

            notice.ProfileImageUrl = profileImageUrl;
            notice.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
