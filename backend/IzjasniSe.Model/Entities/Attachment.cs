using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace IzjasniSe.Model.Entities
{
    public class Attachment : EntityBase
    {
        [Required]
        [MaxLength(2048)] 
        public string FilePathOrUrl { get; set; } = null!; 

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = null!; 

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = null!; 

        public long FileSize { get; set; } 

        [Required]
        public int SuggestionId { get; set; }
        [ForeignKey("SuggestionId")]
        public virtual Suggestion Suggestion { get; set; } = null!;
    }

}
