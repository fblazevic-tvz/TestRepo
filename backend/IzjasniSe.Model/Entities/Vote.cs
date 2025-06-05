using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Model.Entities
{
    public class Vote
    {
        [Required]
        public int SuggestionId { get; set; }
        public virtual Suggestion Suggestion { get; set; } = null!;

        [Required]
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
