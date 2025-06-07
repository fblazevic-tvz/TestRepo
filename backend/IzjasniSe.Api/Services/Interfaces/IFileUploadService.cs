namespace IzjasniSe.Api.Services.Interfaces
{
    public interface IFileUploadService
    {
        Task<string> UploadAvatarAsync(IFormFile file, int userId);
        Task<bool> DeleteAvatarAsync(string filePath);
        bool IsValidImageFile(IFormFile file);
    }
}
