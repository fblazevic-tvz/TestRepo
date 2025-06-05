using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Model.Entities
{
    public class Proposal : EntityBase
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal MaxBudget { get; set; }

        [Required]
        public DateTime SubmissionStart { get; set; }
        [Required]
        public DateTime SubmissionEnd { get; set; }

        [Required]
        public ProposalStatus Status { get; set; }

        [Required]
        public int CityId { get; set; }
        [ForeignKey("CityId")]
        public virtual City City { get; set; } = null!;

        public int? ModeratorId { get; set; }
        [ForeignKey("ModeratorId")]
        public virtual User? Moderator { get; set; }

        public virtual ICollection<Suggestion> Suggestions { get; set; } = new List<Suggestion>();
        public virtual ICollection<Notice> Notices { get; set; } = new List<Notice>();
    }

}
