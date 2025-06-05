using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Dtos

{
    public class UserCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = null!;

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = null!;

        [Required]
        [DataType(DataType.Password)]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = null!;

        [Required]
        public UserRole Role { get; set; }


        public int? CityId { get; set; }
    }
}
