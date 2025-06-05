using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;
using IzjasniSe.Model.Util;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface ICommentService
    {
        Task<IEnumerable<Comment>> GetBySuggestionIdAsync(int suggestionId);
        Task<Comment?> GetByIdAsync(int id);

        Task<Comment?> CreateAsync(CommentCreateDto commentDto);

        Task<AuthorizationResult> UpdateAsync(int id, CommentUpdateDto commentDto);

        Task<AuthorizationResult> DeleteAsync(int id);
    }
}