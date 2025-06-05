using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class CommentCreateDto
    {
        [Required]
        [MinLength(1)]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        public int SuggestionId { get; set; }

        public int? ParentCommentId { get; set; }
    }
}
