using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos.Auth
{
    public class UserDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;

    }
}
