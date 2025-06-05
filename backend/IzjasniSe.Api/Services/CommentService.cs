using Microsoft.EntityFrameworkCore;
using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using System.Security.Claims;
using IzjasniSe.Model.Util;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Services
{
    public class CommentService : ICommentService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<CommentService> _logger;
        private readonly ILoggedInService _loggedInService;

        public CommentService(AppDbContext db, ILoggedInService loggedInService, ILogger<CommentService> logger)
        {
            _db = db;
            _logger = logger;
            _loggedInService = loggedInService;
        }

        

        public async Task<IEnumerable<Comment>> GetBySuggestionIdAsync(int suggestionId)
        {
            return await _db.Comments
                .Where(c => c.SuggestionId == suggestionId && c.ParentCommentId == null)
                .Include(c => c.Author)
                .OrderBy(c => c.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<Comment?> GetByIdAsync(int id)
        {
            return await _db.Comments
               .Include(c => c.Author)
               .FirstOrDefaultAsync(c => c.Id == id);
        }


        public async Task<Comment?> CreateAsync(CommentCreateDto commentDto)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();

            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to create comment by unauthenticated user.");
                return null;
            }

            bool suggestionExists = await _db.Suggestions.AnyAsync(s => s.Id == commentDto.SuggestionId);
            if (!suggestionExists)
            {
                _logger.LogWarning("Attempt to create comment for non-existent suggestion ID: {SuggestionId}", commentDto.SuggestionId);
                return null;
            }

            if (commentDto.ParentCommentId.HasValue)
            {
                bool parentExists = await _db.Comments.AnyAsync(c => c.Id == commentDto.ParentCommentId.Value && c.SuggestionId == commentDto.SuggestionId);
                if (!parentExists)
                {
                    _logger.LogWarning("Attempt to reply to non-existent or mismatched parent comment ID: {ParentCommentId}", commentDto.ParentCommentId.Value);
                    return null;
                }
            }

            var newComment = new Comment
            {
                Content = commentDto.Content,
                SuggestionId = commentDto.SuggestionId,
                ParentCommentId = commentDto.ParentCommentId,
                AuthorId = currentUserId.Value,
                CreatedAt = DateTime.UtcNow
            };

            _db.Comments.Add(newComment);
            await _db.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created comment {CommentId} for suggestion {SuggestionId}", currentUserId.Value, newComment.Id, newComment.SuggestionId);
            await _db.Entry(newComment).Reference(c => c.Author).LoadAsync();

            return newComment;
        }

        public async Task<AuthorizationResult> UpdateAsync(int id, CommentUpdateDto commentDto)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();
            var isAdminOrModerator = _loggedInService.IsCurrentUserAdminOrModerator();

            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to update comment {CommentId} by unauthenticated user.", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "Authentication required.");
            }

            var comment = await _db.Comments.FindAsync(id);

            if (comment == null)
            {
                _logger.LogWarning("Attempt to update non-existent comment ID: {CommentId}", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_NotFound, "Comment not found.");
            }

            if (comment.AuthorId != currentUserId && !isAdminOrModerator)
            {
                _logger.LogWarning("User {UserId} attempted to update comment {CommentId} owned by {OwnerId}. Forbidden.", currentUserId, id, comment.AuthorId);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "You are not authorized to update this comment.");
            }
            comment.Content = commentDto.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated comment {CommentId}.", currentUserId, id);
            return new AuthorizationResult(AuthorizationResultStatus.Allowed);
        }

        public async Task<AuthorizationResult> DeleteAsync(int id)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();
            var isAdminOrModerator = _loggedInService.IsCurrentUserAdminOrModerator();

            if (currentUserId == null)
            {
                _logger.LogWarning("Attempt to delete comment {CommentId} by unauthenticated user.", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "Authentication required.");
            }

            var comment = await _db.Comments.FindAsync(id);

            if (comment == null)
            {
                _logger.LogWarning("Attempt to delete non-existent comment ID: {CommentId}", id);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_NotFound, "Comment not found.");
            }

            if (comment.AuthorId == null && comment.Content == "[Komentar obrisan]")
            {
                _logger.LogInformation("Comment {CommentId} is already deleted. No action taken by User {UserId}.", id, currentUserId);
                return new AuthorizationResult(AuthorizationResultStatus.Allowed);
            }


            if (comment.AuthorId != currentUserId && !isAdminOrModerator)
            {
                _logger.LogWarning("User {UserId} attempted to delete comment {CommentId} owned by {OwnerId}. Forbidden.", currentUserId, id, comment.AuthorId);
                return new AuthorizationResult(AuthorizationResultStatus.Denied_Forbidden, "You are not authorized to delete this comment.");
            }

            comment.Content = "[Komentar obrisan]";
            comment.AuthorId = null;
            comment.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation("User {UserId} logically deleted comment {CommentId}.", currentUserId, id);
            return new AuthorizationResult(AuthorizationResultStatus.Allowed);
        }
    }
}