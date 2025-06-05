using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Dtos
{
    public class ProposalCreateDto
        {
            [Required]
            [MaxLength(150)]
            public string Name { get; set; } = string.Empty;

            [Required]
            public string Description { get; set; } = string.Empty;

            [Required]
            [Range(0, double.MaxValue, ErrorMessage = "MaxBudget must be a non-negative value.")]
            public decimal MaxBudget { get; set; }

            [Required]
            public DateTime SubmissionStart { get; set; }

            [Required]
            public DateTime SubmissionEnd { get; set; }

            [Required]
            public ProposalStatus Status { get; set; }

            [Required]
            public int CityId { get; set; }

            [Required]
            public int ModeratorId { get; set; }
        }
}
