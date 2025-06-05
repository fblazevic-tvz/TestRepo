using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using System.Security.Claims;
using IzjasniSe.Model.Enums;
using IzjasniSe.Model.Util;

namespace IzjasniSe.Api.Services
{
    public class SuggestionService : ISuggestionService
    {
        private readonly AppDbContext _db;
        private readonly IProposalService _proposalService;
        private readonly IUserService _userService;
        private readonly ILocationService _locationService;
        private readonly IHttpContextAccessor _httpContextAccessor; 
        private readonly ILogger<SuggestionService> _logger;

        public SuggestionService(
             AppDbContext db,
             IHttpContextAccessor httpContextAccessor, 
             ILogger<SuggestionService> logger,        
             IProposalService proposalService,         
             ILocationService locationService)         
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor; 
            _logger = logger;                       
            _proposalService = proposalService;
            _locationService = locationService;
        }

        public async Task<IEnumerable<Suggestion>> GetAllAsync()
        {
            return await _db.Suggestions
                .Include(s => s.Author)
                .Include(s => s.Location)
                .ThenInclude(l => l.City)
                .Include(s => s.Proposal)
                .Include(s=>s.Votes)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Suggestion?> GetByIdAsync(int id)
        {
            return await _db.Suggestions
                .Include(s => s.Author)
                .Include(s => s.Location)
                    .ThenInclude(l=>l.City)
                .Include(s => s.Proposal)
                    .ThenInclude(p=>p.City)
                .Include(s => s.Proposal)
                    .ThenInclude(p => p.Moderator)
                .Include(s => s.Votes)
                .Include(s => s.Comments)
                    .ThenInclude(c =>c.Author)
                .Include(s => s.Attachments)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Suggestion>> GetByProposalIdAsync(int proposalId)
        {
            return await _db.Suggestions
                .Where(s => s.ProposalId == proposalId)
                .Include(s => s.Author)
                .Include(s => s.Location)
                    .ThenInclude(l => l.City)
                .Include(s => s.Votes)
                .OrderByDescending(s => s.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Suggestion>> GetByAuthorIdAsync(int authorId)
        {
            return await _db.Suggestions
                .Where(s => s.AuthorId == authorId) 
                .Include(s => s.Author)             
                .Include(s => s.Location)
                    .ThenInclude(l => l.City)
                .Include(s => s.Proposal)
                .Include(s => s.Votes)
                .OrderByDescending(s => s.CreatedAt) 
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Suggestion?> CreateAsync(SuggestionCreateDto suggestionCreateDto)
        {
            var (currentUserId, _) = GetCurrentUser();
           
            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to create suggestion by unauthenticated user.");
                return null; 
            }

            bool proposalExists = await _proposalService.ProposalExistsAsync(suggestionCreateDto.ProposalId);
            if (!proposalExists)
            {
                _logger.LogWarning("Attempt to create suggestion for non-existent proposal ID: {ProposalId}", suggestionCreateDto.ProposalId);
                return null;
            }
            bool locationExists = await _db.Locations.AnyAsync(l => l.Id == suggestionCreateDto.LocationId);
            if (!locationExists)
            {
                _logger.LogWarning("Attempt to create suggestion for non-existent location ID: {LocationId}", suggestionCreateDto.LocationId);
                return null;
            }


            var entity = new Suggestion
            {
                Name = suggestionCreateDto.Name,
                Description = suggestionCreateDto.Description,
                EstimatedCost = suggestionCreateDto.EstimatedCost,
                Status = SuggestionStatus.Submitted, 
                ProposalId = suggestionCreateDto.ProposalId,
                AuthorId = currentUserId.Value, 
                LocationId = suggestionCreateDto.LocationId,
                CreatedAt = DateTime.UtcNow
            };

            _db.Suggestions.Add(entity);
            await _db.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created suggestion {SuggestionId} for proposal {ProposalId}", currentUserId.Value, entity.Id, entity.ProposalId);

            return entity;
        }

        public async Task<AuthorizationResult> UpdateAsync(int id, SuggestionUpdateDto suggestionUpdateDto)
        {
            var (currentUserId, isAdmin) = GetCurrentUser();

            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to update suggestion {SuggestionId} by unauthenticated user.", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "Authentication required.");
            }

            var existingSuggestion = await _db.Suggestions.FirstOrDefaultAsync(s => s.Id == id);

            if (existingSuggestion == null)
            {
                _logger.LogWarning("Attempt to update non-existent suggestion ID: {SuggestionId}", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_NotFound, "Suggestion not found.");
            }


            if (existingSuggestion.AuthorId != currentUserId && !isAdmin)
            {
                _logger.LogWarning("User {UserId} attempted to update suggestion {SuggestionId} owned by {OwnerId}. Forbidden.", currentUserId, id, existingSuggestion.AuthorId);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "You are not authorized to update this suggestion.");
            }

            if (suggestionUpdateDto.LocationId.HasValue)
            {
                var locationExists = await _db.Locations.AnyAsync(l => l.Id == suggestionUpdateDto.LocationId.Value);
                if (!locationExists)
                {
                    _logger.LogWarning("Update suggestion {SuggestionId} failed: Provided LocationId {LocationId} does not exist.", id, suggestionUpdateDto.LocationId.Value);
                    return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "Invalid Location ID provided.");
                }
                existingSuggestion.LocationId = suggestionUpdateDto.LocationId.Value; 
            }


            bool changed = false;
            if (suggestionUpdateDto.Name != null && suggestionUpdateDto.Name != existingSuggestion.Name)
            {
                existingSuggestion.Name = suggestionUpdateDto.Name;
                changed = true;
            }
            if (suggestionUpdateDto.Description != null && suggestionUpdateDto.Description != existingSuggestion.Description)
            {
                existingSuggestion.Description = suggestionUpdateDto.Description;
                changed = true;
            }
            if (suggestionUpdateDto.EstimatedCost.HasValue && suggestionUpdateDto.EstimatedCost.Value != existingSuggestion.EstimatedCost)
            {
                existingSuggestion.EstimatedCost = suggestionUpdateDto.EstimatedCost.Value;
                changed = true;
            }
            if (suggestionUpdateDto.Status.HasValue && suggestionUpdateDto.Status.Value != existingSuggestion.Status)
            {
                if (!isAdmin) return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "Not authorized to change suggestion status.");
                existingSuggestion.Status = suggestionUpdateDto.Status.Value;
                changed = true;
            }

            if (changed)
            {
                existingSuggestion.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                _logger.LogInformation("User {UserId} updated suggestion {SuggestionId}.", currentUserId, id);
            }
            else
            {
                _logger.LogInformation("User {UserId} attempted update on suggestion {SuggestionId}, but no changes were detected.", currentUserId, id);
            }

            return new AuthorizationResult(AuthorizationResultStatus.Allowed);
        }

        public async Task<AuthorizationResult> DeleteAsync(int id)
        {
            var (currentUserId, isAdmin) = GetCurrentUser();

            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to delete suggestion {SuggestionId} by unauthenticated user.", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "Authentication required.");
            }

            var existingSuggestion = await _db.Suggestions.FirstOrDefaultAsync(s => s.Id == id);

            if (existingSuggestion == null)
            {
                _logger.LogWarning("Attempt to delete non-existent suggestion ID: {SuggestionId}", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_NotFound, "Suggestion not found.");
            }

            if (existingSuggestion.AuthorId != currentUserId && !isAdmin)
            {
                _logger.LogWarning("User {UserId} attempted to delete suggestion {SuggestionId} owned by {OwnerId}. Forbidden.", currentUserId, id, existingSuggestion.AuthorId);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "You are not authorized to delete this suggestion.");
            }

            _db.Suggestions.Remove(existingSuggestion);
            await _db.SaveChangesAsync();

            _logger.LogInformation("User {UserId} deleted suggestion {SuggestionId}.", currentUserId, id);
            return new AuthorizationResult(AuthorizationResultStatus.Allowed);
        }

        private (int? UserId, bool IsAdmin) GetCurrentUser()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true) return (null, false);
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId)) return (null, false);
            bool isAdmin = user.IsInRole("Admin");
            return (userId, isAdmin);
        }
    }
}
