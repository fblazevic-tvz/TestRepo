using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Services
{
    public class FileUploadService : IFileUploadService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FileUploadService> _logger;

        private readonly Dictionary<string, string[]> _allowedExtensions = new()
        {
            { "image", new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" } },
            { "document", new[] { ".pdf" } }
        };

        private readonly Dictionary<string, long> _maxFileSizes = new()
        {
            { "image", 5 * 1024 * 1024 }, // 5MB for images
            { "document", 10 * 1024 * 1024 } // 10MB for PDFs
        };

        public FileUploadService(IWebHostEnvironment environment, ILogger<FileUploadService> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<string> UploadFileAsync(IFormFile file, FileUploadType uploadType, int entityId, string entityType)
        {
            var fileType = GetFileType(file);
            if (!IsValidFile(file, fileType))
            {
                throw new InvalidOperationException($"Invalid {fileType} file");
            }

            // Create directory structure
            var uploadsFolder = GetUploadPath(entityType, uploadType);
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileName = GenerateFileName(entityId, entityType, file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative URL
            return GetRelativeUrl(entityType, uploadType, fileName);
        }

        public async Task<string> UploadAvatarAsync(IFormFile file, int userId)
        {
            return await UploadFileAsync(file, FileUploadType.ProfileImage, userId, "users");
        }

        public async Task<string> UploadProfileImageAsync(IFormFile file, int entityId, string entityType)
        {
            // Delete existing profile image if exists
            var existingFiles = GetExistingProfileImages(entityId, entityType);
            foreach (var existingFile in existingFiles)
            {
                await DeleteFileAsync(existingFile);
            }

            return await UploadFileAsync(file, FileUploadType.ProfileImage, entityId, entityType);
        }

        public async Task<string> UploadAttachmentAsync(IFormFile file, int entityId, string entityType)
        {
            if (!IsValidFile(file, "document"))
            {
                throw new InvalidOperationException("Only PDF files are allowed as attachments");
            }

            return await UploadFileAsync(file, FileUploadType.Attachment, entityId, entityType);
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return false;

            try
            {
                var fullPath = Path.Combine(_environment.WebRootPath, filePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                    _logger.LogInformation("Deleted file: {FilePath}", filePath);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file: {FilePath}", filePath);
            }

            return false;
        }

        public async Task<bool> DeleteAvatarAsync(string filePath)
        {
            return await DeleteFileAsync(filePath);
        }

        public bool IsValidImageFile(IFormFile file)
        {
            return IsValidFile(file, "image");
        }

        public bool IsValidFile(IFormFile file, string fileType)
        {
            if (file == null || file.Length == 0)
                return false;

            if (!_maxFileSizes.ContainsKey(fileType) || !_allowedExtensions.ContainsKey(fileType))
                return false;

            if (file.Length > _maxFileSizes[fileType])
                return false;

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions[fileType].Contains(extension))
                return false;

            // Additional content validation
            if (fileType == "image")
            {
                return ValidateImageContent(file);
            }
            else if (fileType == "document")
            {
                return ValidatePdfContent(file);
            }

            return false;
        }

        private bool ValidateImageContent(IFormFile file)
        {
            try
            {
                using var stream = file.OpenReadStream();
                var buffer = new byte[512];
                stream.Read(buffer, 0, 512);
                stream.Seek(0, SeekOrigin.Begin);

                // Check file signatures
                if (buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF) return true; // JPEG
                if (buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47) return true; // PNG
                if (buffer[0] == 0x47 && buffer[1] == 0x49 && buffer[2] == 0x46) return true; // GIF
                if (buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46) return true; // WEBP
            }
            catch
            {
                return false;
            }

            return false;
        }

        private bool ValidatePdfContent(IFormFile file)
        {
            try
            {
                using var stream = file.OpenReadStream();
                var buffer = new byte[5];
                stream.Read(buffer, 0, 5);
                stream.Seek(0, SeekOrigin.Begin);

                // Check PDF signature
                return buffer[0] == 0x25 && buffer[1] == 0x50 && buffer[2] == 0x44 && buffer[3] == 0x46; // %PDF
            }
            catch
            {
                return false;
            }
        }

        private string GetFileType(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (_allowedExtensions["image"].Contains(extension))
                return "image";
            if (_allowedExtensions["document"].Contains(extension))
                return "document";

            return "unknown";
        }

        private string GetUploadPath(string entityType, FileUploadType uploadType)
        {
            var basePath = Path.Combine(_environment.WebRootPath, "uploads", entityType);

            return uploadType switch
            {
                FileUploadType.ProfileImage => Path.Combine(basePath, "profile"),
                FileUploadType.Attachment => Path.Combine(basePath, "attachments"),
                _ => basePath
            };
        }

        private string GenerateFileName(int entityId, string entityType, string originalFileName)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var guid = Guid.NewGuid().ToString("N").Substring(0, 8);
            var extension = Path.GetExtension(originalFileName);

            return $"{entityType}_{entityId}_{timestamp}_{guid}{extension}";
        }

        private string GetRelativeUrl(string entityType, FileUploadType uploadType, string fileName)
        {
            var path = uploadType switch
            {
                FileUploadType.ProfileImage => $"/uploads/{entityType}/profile/{fileName}",
                FileUploadType.Attachment => $"/uploads/{entityType}/attachments/{fileName}",
                _ => $"/uploads/{entityType}/{fileName}"
            };

            return path;
        }

        private List<string> GetExistingProfileImages(int entityId, string entityType)
        {
            var profilePath = GetUploadPath(entityType, FileUploadType.ProfileImage);
            var existingFiles = new List<string>();

            if (Directory.Exists(profilePath))
            {
                var searchPattern = $"{entityType}_{entityId}_*";
                var files = Directory.GetFiles(profilePath, searchPattern);

                foreach (var file in files)
                {
                    var fileName = Path.GetFileName(file);
                    existingFiles.Add(GetRelativeUrl(entityType, FileUploadType.ProfileImage, fileName));
                }
            }

            return existingFiles;
        }
    }

    public enum FileUploadType
    {
        ProfileImage,
        Attachment
    }
}