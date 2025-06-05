using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace IzjasniSe.Model.Entities
{
    public class Comment : EntityBase
    {
        [Required]
        public string Content { get; set; } = null!;

        public bool IsVisible { get; set; } = true;

        [Required]
        public int SuggestionId { get; set; }
        [ForeignKey("SuggestionId")]
        public virtual Suggestion Suggestion { get; set; } = null!;

        
        public int? AuthorId { get; set; }
        [ForeignKey("AuthorId")]
        public virtual User? Author { get; set; }

        public int? ParentCommentId { get; set; }
        [ForeignKey("ParentCommentId")]
        public virtual Comment? ParentComment { get; set; }

        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
    }
}
