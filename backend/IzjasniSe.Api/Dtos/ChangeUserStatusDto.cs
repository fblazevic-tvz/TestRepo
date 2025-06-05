using IzjasniSe.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class ChangeUserStatusDto
    {
        [Required]
        public UserAccountStatus Status { get; set; }
    }
}
