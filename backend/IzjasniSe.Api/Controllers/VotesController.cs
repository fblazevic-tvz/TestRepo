using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VotesController : ControllerBase
    {
        private readonly IVoteService _votes;
        private readonly ILogger<VotesController> _logger;

        public VotesController(IVoteService votes, ILogger<VotesController> logger)
        {
            _votes = votes;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Vote>>> GetAll()
        {
            var list = await _votes.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{suggestionId:int}/{userId:int}", Name = "GetVote")]
        public async Task<ActionResult<Vote>> GetById(int suggestionId, int userId)
        {
            var vote = await _votes.GetByIdAsync(suggestionId, userId);
            if (vote == null)
            {
                _logger.LogWarning("Vote not found for Suggestion {SuggestionId} by User {UserId}", suggestionId, userId);
                return NotFound();
            }
            return Ok(vote);
        }

        [HttpPost("toggle/{suggestionId:int}")]
        [Authorize]
        public async Task<ActionResult<ToggleVoteResponseDto>> ToggleVote(int suggestionId)
        {
            if (suggestionId <= 0)
            {
                return BadRequest("Invalid Suggestion ID.");
            }

            var result = await _votes.ToggleVoteAsync(suggestionId);

            if (result == null)
            {
                _logger.LogWarning("Toggle vote failed for suggestion {SuggestionId}, possibly not found.", suggestionId);
                return NotFound("Suggestion not found or operation failed.");
            }

            return Ok(result);
        }

        [HttpGet("myVotes")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<int>>> GetMyVotedSuggestionIds()
        {
            var ids = await _votes.GetVotedSuggestionIdsForCurrentUserAsync();
            return Ok(ids);
        }

        [HttpPost]
        public async Task<ActionResult<Vote>> Create([FromBody] VoteCreateDto voteCreateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _votes.CreateAsync(voteCreateDto);

            if (created == null)
            {
               ModelState.AddModelError(
                    "VoteCreating",
                    "The creation of the vote failed.");
                return BadRequest(ModelState);
            }

            return CreatedAtRoute(
                "GetVote",
                new { suggestionId = created.SuggestionId, userId = created.UserId },
                created
            );
        }

        [HttpDelete("{suggestionId:int}/{userId:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int suggestionId, int userId)
        {
            var ok = await _votes.DeleteAsync(suggestionId, userId);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
