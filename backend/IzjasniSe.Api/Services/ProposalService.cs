using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Model.Dtos;
using IzjasniSe.Api.Dtos;

namespace IzjasniSe.Api.Services
{
    public class ProposalService : IProposalService
    {
        private readonly AppDbContext _db;
        private readonly IUserService _userService;
        private readonly ICityService _cityService;
        private readonly ILoggedInService _loggedInService;
        private readonly IFileUploadService _fileUploadService;

        public ProposalService(AppDbContext db, IUserService userService, ICityService cityService, ILoggedInService loggedInService, IFileUploadService fileUploadService)
        {
            _db = db;
            _userService = userService;
            _cityService = cityService;
            _loggedInService = loggedInService;
            _fileUploadService = fileUploadService;
        }

        public async Task<IEnumerable<Proposal>> GetAllAsync()
        {
            return await _db.Proposals
                            .Include(p => p.City)
                            .Include(p => p.Moderator)
                            .AsNoTracking()
                            .ToListAsync();
        }

        public async Task<IEnumerable<Proposal>> GetByModeratorIdAsync(int moderatorId)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (currentUserId != moderatorId)
            {
                return new List<Proposal>();
            }
            return await _db.Proposals
                           .Where(p => p.ModeratorId == moderatorId)
                           .Include(p => p.City)
                           .Include(p => p.Moderator)
                           .AsNoTracking()
                           .ToListAsync();
        }

        public async Task<Proposal?> GetByIdAsync(int id)
        {
            return await _db.Proposals
                            .Include(p => p.City)
                            .Include(p => p.Moderator)
                            .Include(p => p.Suggestions)
                            .Include(p => p.Notices)
                            .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Proposal?> CreateAsync(ProposalCreateDto proposalCreateDto)
        {
            bool isValid = true;
            var foundUser = await _userService.GetByIdAsync(proposalCreateDto.ModeratorId);
            var currentUserId = _loggedInService.GetCurrentUserId();

            if (foundUser == null || currentUserId != foundUser.Id)
            {
                isValid = false;
            }
            var foundCity = await _cityService.GetByIdAsync(proposalCreateDto.CityId);
            
            if (foundCity == null)
            {
                isValid = false;
            }

            if (isValid) {

                var entity = new Proposal
                {
                    Name = proposalCreateDto.Name,
                    Description = proposalCreateDto.Description,
                    MaxBudget = proposalCreateDto.MaxBudget,
                    SubmissionStart = proposalCreateDto.SubmissionStart,
                    SubmissionEnd = proposalCreateDto.SubmissionEnd,
                    Status = proposalCreateDto.Status,
                    CityId = proposalCreateDto.CityId,
                    ModeratorId = proposalCreateDto.ModeratorId,
                    CreatedAt = DateTime.UtcNow,

                };

                _db.Proposals.Add(entity);
                await _db.SaveChangesAsync();
                return entity;
            }

            return null;
          
        }

        public async Task<bool> UpdateAsync(int id, ProposalUpdateDto proposalUpdateDto)
        {
            var existingProposal = await GetByIdAsync(id);
            if (existingProposal == null)
                return false;

            var currentUserId = _loggedInService.GetCurrentUserId();
            
            if (existingProposal.ModeratorId != currentUserId)
            {
                return false;
            }

            if (proposalUpdateDto.CityId.HasValue)
            {
                var foundCity = await _cityService.GetByIdAsync(proposalUpdateDto.CityId.Value);

                if (foundCity == null)
                {
                    return false;
                }
            }

            if (proposalUpdateDto.Name != null)
                existingProposal.Name = proposalUpdateDto.Name;

            if (proposalUpdateDto.Description != null)
                existingProposal.Description = proposalUpdateDto.Description;

            if (proposalUpdateDto.MaxBudget.HasValue)
                existingProposal.MaxBudget = proposalUpdateDto.MaxBudget.Value;

            if (proposalUpdateDto.SubmissionStart.HasValue)
                existingProposal.SubmissionStart = proposalUpdateDto.SubmissionStart.Value;

            if (proposalUpdateDto.SubmissionEnd.HasValue)
                existingProposal.SubmissionEnd = proposalUpdateDto.SubmissionEnd.Value;

            if (proposalUpdateDto.Status.HasValue)
                existingProposal.Status = proposalUpdateDto.Status.Value;

            if (proposalUpdateDto.CityId.HasValue)
                existingProposal.CityId = proposalUpdateDto.CityId.Value;

            existingProposal.UpdatedAt = DateTime.UtcNow;

            _db.Proposals.Update(existingProposal);
            await _db.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _db.Proposals.FindAsync(id);
            if (existing == null) return false;

            var currentUserId = _loggedInService.GetCurrentUserId();
            
            if (existing.ModeratorId != currentUserId)
            {
                return false;
            }

            _db.Proposals.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ProposalExistsAsync(int id) {
            return await _db.Proposals.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> UpdateProfileImageAsync(int id, string profileImageUrl)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (currentUserId == null)
                return false;

            var proposal = await _db.Proposals.FindAsync(id);
            if (proposal == null)
                return false;

            // Check if user is the moderator or admin
            if (proposal.ModeratorId != currentUserId)
                return false;

            if (!string.IsNullOrEmpty(proposal.ProfileImageUrl))
            {
                await _fileUploadService.DeleteFileAsync(proposal.ProfileImageUrl);
            }

            proposal.ProfileImageUrl = profileImageUrl;
            proposal.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
