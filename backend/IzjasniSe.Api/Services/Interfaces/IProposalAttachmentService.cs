using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface IProposalAttachmentService
    {
        Task<IEnumerable<ProposalAttachment>> GetByProposalIdAsync(int proposalId);
        Task<ProposalAttachment?> GetByIdAsync(int id);
        Task<ProposalAttachment> CreateAsync(ProposalAttachment attachment);
        Task<bool> DeleteAsync(int id);
    }
}
