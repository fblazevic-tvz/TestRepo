using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Model.Entities
{
    public class Notice : EntityBase
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = null!;

        [Required]
        public string Content { get; set; } = null!;

        [MaxLength(500)]
        public string? ProfileImageUrl { get; set; }

        [Required]
        public int ProposalId { get; set; }
        [ForeignKey("ProposalId")]
        public virtual Proposal Proposal { get; set; } = null!;

        public int? ModeratorId { get; set; }
        [ForeignKey("ModeratorId")]
        public virtual User? Moderator { get; set; }
        public virtual ICollection<NoticeAttachment> Attachments { get; set; } = new List<NoticeAttachment>();
    }
}
