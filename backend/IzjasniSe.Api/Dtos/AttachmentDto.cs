namespace IzjasniSe.Api.Dtos
{
    public class AttachmentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = null!;
        public string ContentType { get; set; } = null!;
        public long FileSize { get; set; }
        public string? Description { get; set; }
        public string FileUrl { get; set; } = null!;
        public string DownloadUrl { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        // Helper method to format file size
        public string FormattedFileSize
        {
            get
            {
                string[] sizes = { "B", "KB", "MB", "GB" };
                double len = FileSize;
                int order = 0;
                while (len >= 1024 && order < sizes.Length - 1)
                {
                    order++;
                    len = len / 1024;
                }
                return $"{len:0.##} {sizes[order]}";
            }
        }
    }
}
