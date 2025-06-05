using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Enums;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _comments;
        private readonly ILogger<CommentsController> _logger;

        public CommentsController(ICommentService comments, ILogger<CommentsController> logger)
        {
            _comments = comments;
            _logger = logger;
        }

        [HttpGet("bySuggestion/{suggestionId:int}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetBySuggestion(int suggestionId)
        {
            var list = await _comments.GetBySuggestionIdAsync(suggestionId);
            return Ok(list);
        }


        [HttpGet("{id:int}", Name = "GetCommentById")]
        public async Task<ActionResult<Comment>> GetById(int id)
        {
            var comment = await _comments.GetByIdAsync(id);
            if (comment == null) return NotFound();
            return Ok(comment);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Comment>> Create([FromBody] CommentCreateDto commentDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdComment = await _comments.CreateAsync(commentDto);

            if (createdComment == null)
            {
                ModelState.AddModelError("CommentCreation", "Could not create comment. Ensure Suggestion/Parent exists.");
                return BadRequest(ModelState);
            }

            return CreatedAtRoute("GetCommentById", new { id = createdComment.Id }, createdComment);
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] CommentUpdateDto commentDto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _comments.UpdateAsync(id, commentDto);

            return result.Status switch
            {
                AuthorizationResultStatus.Allowed => NoContent(),
                AuthorizationResultStatus.Denied_NotFound => NotFound(result.Message),
                AuthorizationResultStatus.Denied_Forbidden => Forbid(),
                _ => StatusCode(500, "An unexpected error occurred during update.")
            };
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _comments.DeleteAsync(id);

            return result.Status switch
            {
                AuthorizationResultStatus.Allowed => NoContent(),
                AuthorizationResultStatus.Denied_NotFound => NotFound(result.Message),
                AuthorizationResultStatus.Denied_Forbidden => Forbid(),
                _ => StatusCode(500, "An unexpected error occurred during deletion.")
            };
        }
    }
}