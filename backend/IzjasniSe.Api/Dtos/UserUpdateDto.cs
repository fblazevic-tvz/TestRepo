using System.ComponentModel.DataAnnotations;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Dtos
{
    public class UserUpdateDto
    {
        [EmailAddress]
        [MaxLength(255)]
        public string? Email { get; set; }

        [DataType(DataType.Password)]
        [MinLength(6, ErrorMessage = "Current password must be at least 6 characters")]
        public string? CurrentPassword { get; set; }

        [DataType(DataType.Password)]
        [MinLength(6, ErrorMessage = "New password must be at least 6 characters")]
        public string? NewPassword { get; set; }

        public UserAccountStatus? AccountStatus { get; set; }
    }
}
