using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Model.Entities
{
    public class User : EntityBase
    {
        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = null!;

        [Required]
        public string PasswordHash { get; set; } = null!;

        [Required]
        public UserRole Role { get; set; } = UserRole.Regular;

        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        [Required]
        public UserAccountStatus AccountStatus { get; set; } = UserAccountStatus.Active;
        public int? CityId { get; set; }
        public virtual City? City { get; set; }
        public virtual ICollection<Suggestion> AuthoredSuggestions { get; set; } = new List<Suggestion>();
        public virtual ICollection<Vote> Votes { get; set; } = new List<Vote>();
        public virtual ICollection<Comment> AuthoredComments { get; set; } = new List<Comment>();
        public virtual ICollection<Notice> AuthoredNotices { get; set; } = new List<Notice>();
        public virtual ICollection<Proposal> ManagedProposals { get; set; } = new List<Proposal>();
    }
}
