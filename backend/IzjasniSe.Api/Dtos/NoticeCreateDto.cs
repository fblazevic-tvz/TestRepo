using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class NoticeCreateDto
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = null!;

        [Required]
        public string Content { get; set; } = null!;

        [Required]
        public int ProposalId { get; set; }
        [Required]
        public int ModeratorId { get; set; }
        }
}
