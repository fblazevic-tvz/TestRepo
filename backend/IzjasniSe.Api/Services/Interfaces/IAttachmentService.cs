using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface IAttachmentService
    {
        Task<IEnumerable<Attachment>> GetAllAsync();
        Task<Attachment?> GetByIdAsync(int id);
        Task<Attachment> CreateAsync(Attachment attachment);
        Task<bool> UpdateAsync(Attachment attachment);
        Task<bool> DeleteAsync(int id);
    }
}
