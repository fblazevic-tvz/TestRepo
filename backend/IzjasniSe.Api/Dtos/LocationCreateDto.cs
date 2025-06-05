using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class LocationCreateDto
    {
        [Required, MaxLength(150)]
        public string Name { get; set; } = null!;
        [MaxLength(255)] public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        [Required]
        public int CityId { get; set; }
    }

}
