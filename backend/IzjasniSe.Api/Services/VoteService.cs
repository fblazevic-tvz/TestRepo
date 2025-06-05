using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using System.Security.Claims;

namespace IzjasniSe.Api.Services
{
    public class VoteService : IVoteService
    {
        private readonly AppDbContext _db;
        private readonly ISuggestionService _suggestionService;
        private readonly IUserService _userService;
        private readonly IHttpContextAccessor _httpContextAccessor; 
        private readonly ILogger<VoteService> _logger;

        public VoteService(AppDbContext db, ISuggestionService suggestionService, IUserService userService, IHttpContextAccessor httpContextAccessor, ILogger<VoteService> logger)
        {
            _db = db;
            _suggestionService = suggestionService;
            _userService = userService;
            _httpContextAccessor = httpContextAccessor; 
            _logger = logger;
        }

        public async Task<IEnumerable<Vote>> GetAllAsync()
        {
            return await _db.Votes
                .Include(v => v.User)
                .Include(v => v.Suggestion)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Vote?> GetByIdAsync(int suggestionId, int userId)
        {
            return await _db.Votes
                .Include(v => v.User)
                .Include(v => v.Suggestion)
                .FirstOrDefaultAsync(v =>
                    v.SuggestionId == suggestionId &&
                    v.UserId == userId);
        }

        public async Task<ToggleVoteResponseDto?> ToggleVoteAsync(int suggestionId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to toggle vote by unauthenticated user for suggestion {SuggestionId}.", suggestionId);
                return null;
            }

            bool suggestionExists = await _db.Suggestions.AnyAsync(s => s.Id == suggestionId);
            if (!suggestionExists)
            {
                _logger.LogWarning("User {UserId} attempted to vote on non-existent suggestion {SuggestionId}.", currentUserId.Value, suggestionId);
                return null;
            }

            var existingVote = await _db.Votes.FirstOrDefaultAsync(v =>
                v.SuggestionId == suggestionId &&
                v.UserId == currentUserId.Value);

            bool currentUserHasVotedAfterToggle;

            if (existingVote != null)
            {
                _db.Votes.Remove(existingVote);
                await _db.SaveChangesAsync();
                currentUserHasVotedAfterToggle = false;
                _logger.LogInformation("User {UserId} removed vote from suggestion {SuggestionId}.", currentUserId.Value, suggestionId);
            }
            else
            {
                var newVote = new Vote
                {
                    SuggestionId = suggestionId,
                    UserId = currentUserId.Value,
                    CreatedAt = DateTime.UtcNow
                };
                _db.Votes.Add(newVote);
                await _db.SaveChangesAsync();
                currentUserHasVotedAfterToggle = true;
                _logger.LogInformation("User {UserId} added vote to suggestion {SuggestionId}.", currentUserId.Value, suggestionId);
            }

            int newVoteCount = await _db.Votes.CountAsync(v => v.SuggestionId == suggestionId);

            return new ToggleVoteResponseDto(currentUserHasVotedAfterToggle, newVoteCount);
        }

        public async Task<IEnumerable<int>> GetVotedSuggestionIdsForCurrentUserAsync()
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
            {
                return Enumerable.Empty<int>(); 
            }

            return await _db.Votes
                .Where(v => v.UserId == currentUserId.Value)
                .Select(v => v.SuggestionId) 
                .Distinct() 
                .ToListAsync();
        }

        public async Task<Vote?> CreateAsync(VoteCreateDto voteCreateDto)
        {
            bool isValid = true;
            var existingSuggestion = await _suggestionService.GetByIdAsync(voteCreateDto.SuggestionId);
            if (existingSuggestion == null)
            {
                isValid = false;
            }

            var existingUser = await _userService.GetByIdAsync(voteCreateDto.UserId);
            if (existingUser == null) 
            {
                isValid = false;
            }

            if (isValid)
            {
                var entity = new Vote
                {
                    SuggestionId = voteCreateDto.SuggestionId,
                    UserId = voteCreateDto.UserId,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Votes.Add(entity);
                await _db.SaveChangesAsync();
                return entity;
            }

            return null;
        }

        public async Task<bool> DeleteAsync(int suggestionId, int userId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null || currentUserId != userId)
            {
                _logger.LogWarning("Unauthorized delete attempt by user {UserId} for suggestion {SuggestionId}.", currentUserId, suggestionId);
                return false;
            }
            var existing = await _db.Votes.FindAsync(suggestionId, userId);
            if (existing == null) return false;

            _db.Votes.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }

        private int? GetCurrentUserId() 
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true) return null;
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId)) return null;
            return userId;
        }
    }
}
