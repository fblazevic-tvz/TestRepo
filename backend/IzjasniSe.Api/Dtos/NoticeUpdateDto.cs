using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class NoticeUpdateDto
    {
        [MaxLength(150)]
        public string? Title { get; set; } = null!;
        public string? Content { get; set; } = null!;
        public int ProposalId { get; set; }
        public int ModeratorId { get; set; }
    }
}
