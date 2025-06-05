using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Model.Entities
{
    public class Location : EntityBase
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = null!;

        [MaxLength(255)]
        public string? Address { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        [Required]
        public int CityId { get; set; }
        [ForeignKey("CityId")]
        public virtual City City { get; set; } = null!;

        public virtual ICollection<Suggestion> Suggestions { get; set; } = new List<Suggestion>();
    }
}
