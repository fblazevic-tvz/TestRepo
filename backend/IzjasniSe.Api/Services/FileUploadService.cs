using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FileUploadService> _logger;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private const long _maxFileSize = 5 * 1024 * 1024; // 5MB

        public FileUploadService(IWebHostEnvironment environment, ILogger<FileUploadService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> UploadAvatarAsync(IFormFile file, int userId)
        {
            if (!IsValidImageFile(file))
            {
                throw new InvalidOperationException("Invalid image file");
            }

            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "avatars");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative URL
            return $"/uploads/avatars/{fileName}";
        }

        public async Task<bool> DeleteAvatarAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return false;

            try
            {
                var fullPath = Path.Combine(_environment.WebRootPath, filePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting avatar file: {FilePath}", filePath);
            }

            return false;
        }

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            if (file.Length > _maxFileSize)
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
                return false;

            // Additional check for file content
            try
            {
                using var stream = file.OpenReadStream();
                var buffer = new byte[512];
                stream.Read(buffer, 0, 512);
                stream.Seek(0, SeekOrigin.Begin);

                // Check file signatures for common image formats
                if (buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF) // JPEG
                    return true;
                if (buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47) // PNG
                    return true;
                if (buffer[0] == 0x47 && buffer[1] == 0x49 && buffer[2] == 0x46) // GIF
                    return true;
                if (buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46) // WEBP
                    return true;
            }
            catch
            {
                return false;
            }

            return false;
        }
    }
}