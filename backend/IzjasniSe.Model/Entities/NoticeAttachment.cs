using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Model.Entities
{
    public class NoticeAttachment : EntityBase
    {
        [Required]
        [MaxLength(2048)]
        public string FilePathOrUrl { get; set; } = null!;

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = null!;

        public long FileSize { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public int NoticeId { get; set; }
        [ForeignKey("NoticeId")]
        public virtual Notice Notice { get; set; } = null!;
    }
}