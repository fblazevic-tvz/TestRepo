using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class CommentUpdateDto
    {
        [Required]
        [MinLength(1)]
        [MaxLength(2000)]
        public string? Content { get; set; }
    }
}
