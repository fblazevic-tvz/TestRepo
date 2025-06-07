using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class UserAvatarUpdateDto
    {
        [Required]
        public IFormFile Avatar { get; set; } = null!;
    }
}
