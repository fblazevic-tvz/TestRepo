using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class ProfileImageUploadDto
    {
        [Required]
        public IFormFile ProfileImage { get; set; } = null!;
    }
}
