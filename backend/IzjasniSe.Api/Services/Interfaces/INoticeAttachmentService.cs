using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface INoticeAttachmentService
    {
        Task<IEnumerable<NoticeAttachment>> GetByNoticeIdAsync(int noticeId);
        Task<NoticeAttachment?> GetByIdAsync(int id);
        Task<NoticeAttachment> CreateAsync(NoticeAttachment attachment);
        Task<bool> DeleteAsync(int id);
    }
}
