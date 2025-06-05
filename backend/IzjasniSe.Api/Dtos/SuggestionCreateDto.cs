using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class SuggestionCreateDto
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "EstimatedCost must be a non-negative value.")]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal EstimatedCost { get; set; }

        [Required]
        public int ProposalId { get; set; }

        [Required]
        public int LocationId { get; set; }
    }
}
