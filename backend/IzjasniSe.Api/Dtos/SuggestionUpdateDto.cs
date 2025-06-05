using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Dtos
{
    public class SuggestionUpdateDto
    {
        [MaxLength(150)]
        public string? Name { get; set; }

        public string? Description { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "EstimatedCost must be a non-negative value.")]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? EstimatedCost { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public SuggestionStatus? Status { get; set; }

        public int? LocationId { get; set; }
    }
}
