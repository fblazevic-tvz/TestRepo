using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public record ToggleVoteResponseDto(bool UserHasVoted, int NewVoteCount);
    public interface IVoteService
    {
        Task<IEnumerable<Vote>> GetAllAsync();
        Task<Vote?> GetByIdAsync(int suggestionId, int userId);
        Task<Vote?> CreateAsync(VoteCreateDto voteCreateDto);
        Task<bool> DeleteAsync(int suggestionId, int userId);

        Task<ToggleVoteResponseDto?> ToggleVoteAsync(int suggestionId);
        Task<IEnumerable<int>> GetVotedSuggestionIdsForCurrentUserAsync();
    }
}
