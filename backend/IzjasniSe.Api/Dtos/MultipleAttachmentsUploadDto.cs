using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Api.Dtos
{
    public class MultipleAttachmentsUploadDto
    {
        [Required]
        public List<IFormFile> Files { get; set; } = new();

        public List<string> Descriptions { get; set; } = new();
    }
}
