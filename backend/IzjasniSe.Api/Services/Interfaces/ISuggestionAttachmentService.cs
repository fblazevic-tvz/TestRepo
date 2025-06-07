using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface ISuggestionAttachmentService
    {
        Task<IEnumerable<SuggestionAttachment>> GetBySuggestionIdAsync(int suggestionId);
        Task<SuggestionAttachment?> GetByIdAsync(int id);
        Task<SuggestionAttachment> CreateAsync(SuggestionAttachment attachment);
        Task<bool> DeleteAsync(int id);
    }
}
