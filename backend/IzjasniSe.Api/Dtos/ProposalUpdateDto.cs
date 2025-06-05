using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Model.Dtos
{
    public class ProposalUpdateDto
    {
        [MaxLength(150)]
        public string? Name { get; set; }

        public string? Description { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "MaxBudget must be a non-negative value.")]
        public decimal? MaxBudget { get; set; }

        public DateTime? SubmissionStart { get; set; }

        public DateTime? SubmissionEnd { get; set; }

        public ProposalStatus? Status { get; set; }

        public int? CityId { get; set; }

    }
}
