using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Model.Entities
{
    public class City : EntityBase
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string Postcode { get; set; } = null!;

        public virtual ICollection<Location> Locations { get; set; } = new List<Location>();
        public virtual ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
        public virtual ICollection<User> Moderators { get; set; } = new List<User>();
    }
}
