using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;
using IzjasniSe.Model.Util;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface ISuggestionService
    {
        Task<IEnumerable<Suggestion>> GetAllAsync();
        Task<Suggestion?> GetByIdAsync(int id);
        Task<IEnumerable<Suggestion>> GetByProposalIdAsync(int proposalId);
        Task<IEnumerable<Suggestion>> GetByAuthorIdAsync(int authorId);
        Task<Suggestion?> CreateAsync(SuggestionCreateDto suggestionCreateDto);
        Task<AuthorizationResult> UpdateAsync(int id, SuggestionUpdateDto suggestionUpdateDto);
        Task<AuthorizationResult> DeleteAsync(int id);
        Task<bool> UpdateProfileImageAsync(int id, string profileImageUrl);
    }
}
