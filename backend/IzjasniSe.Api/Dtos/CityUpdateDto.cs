using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class CityUpdateDto
    {
        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(20)]
        public string? Postcode { get; set; }
    }
}
