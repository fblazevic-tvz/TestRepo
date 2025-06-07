using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Dtos;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface IProposalService
    {
        Task<IEnumerable<Proposal>> GetAllAsync();
        Task<Proposal?> GetByIdAsync(int id);
        Task<IEnumerable<Proposal>> GetByModeratorIdAsync(int moderatorId);
        Task<Proposal?> CreateAsync(ProposalCreateDto proposalCreateDto);
        Task<bool> UpdateAsync(int id, ProposalUpdateDto proposalUpdateDto);
        Task<bool> DeleteAsync(int id);
        Task<bool> ProposalExistsAsync(int id);
        Task<bool> UpdateProfileImageAsync(int id, string profileImageUrl);
    }
}
