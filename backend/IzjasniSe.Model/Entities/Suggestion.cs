using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Model.Entities
{
    public class Suggestion : EntityBase
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal EstimatedCost { get; set; }

        [Required]
        public SuggestionStatus Status { get; set; }

        [MaxLength(500)]
        public string? ProfileImageUrl { get; set; }

        [Required]
        public int ProposalId { get; set; }
        [ForeignKey("ProposalId")]
        public virtual Proposal Proposal { get; set; } = null!;

        public int? AuthorId { get; set; }
        [ForeignKey("AuthorId")]
        public virtual User? Author { get; set; }

        [Required]
        public int LocationId { get; set; }
        [ForeignKey("LocationId")]
        public virtual Location Location { get; set; } = null!;

        public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<SuggestionAttachment> Attachments { get; set; } = new List<SuggestionAttachment>();

        [NotMapped] 
        public int VoteCount => Votes?.Count ?? 0;
    }
}
