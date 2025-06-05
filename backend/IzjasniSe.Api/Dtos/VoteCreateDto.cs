using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class VoteCreateDto
    {
        [Required]
        public int SuggestionId { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}
