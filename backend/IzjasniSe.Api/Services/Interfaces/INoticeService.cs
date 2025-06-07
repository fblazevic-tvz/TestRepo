using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface INoticeService
    {
        Task<IEnumerable<Notice>> GetAllAsync();
        Task<Notice?> GetByIdAsync(int id);
        Task<Notice?> CreateAsync(NoticeCreateDto noticeCreateDto);
        Task<bool> UpdateAsync(int id, NoticeUpdateDto noticeUpdateDto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<Notice>> GetByProposalIdAsync(int proposalId);
        Task<bool> UpdateProfileImageAsync(int id, string profileImageUrl);
    }
}
