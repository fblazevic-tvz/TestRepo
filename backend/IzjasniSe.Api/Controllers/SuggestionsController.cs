using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Enums;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuggestionsController : ControllerBase
    {
        private readonly ISuggestionService _suggestions;
        private readonly ILogger<SuggestionsController> _logger;

        public SuggestionsController(ISuggestionService suggestions, ILogger<SuggestionsController> logger)
        {
            _suggestions = suggestions;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Suggestion>>> GetAll()
        {
            var list = await _suggestions.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}", Name = "GetSuggestionById")]
        public async Task<ActionResult<Suggestion>> GetById(int id)
        {
            var sug = await _suggestions.GetByIdAsync(id);
            if (sug == null)
            {
                _logger.LogWarning("Suggestion {Id} not found", id);
                return NotFound();
            }
            return Ok(sug);
        }


        [HttpGet("byProposal/{proposalId:int}")]
        public async Task<ActionResult<IEnumerable<Suggestion>>> GetByProposal(int proposalId)
        {
            _logger.LogInformation("Fetching suggestions for Proposal ID: {ProposalId}", proposalId);
            var list = await _suggestions.GetByProposalIdAsync(proposalId);
            return Ok(list);
        }

        [HttpGet("mySuggestions")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Suggestion>>> GetMySuggestions()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var userId))
            {
                _logger.LogWarning("Could not parse User ID from claims for mySuggestions endpoint.");
                return Unauthorized("Invalid user identifier.");
            }

            _logger.LogInformation("Fetching suggestions for Author ID: {AuthorId}", userId);
            var list = await _suggestions.GetByAuthorIdAsync(userId);
            return Ok(list);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Suggestion>> Create([FromBody] SuggestionCreateDto suggestionCreateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);


            var created = await _suggestions.CreateAsync(suggestionCreateDto);

            if (created == null)
            {
                ModelState.AddModelError("SuggestionCreation", "Nije moguće kreirati prijedlog. Provjerite postoje li povezani Natječaj i Lokacija.");
                return BadRequest(ModelState);
            }

            return CreatedAtRoute("GetSuggestionById", new { id = created.Id }, created);
        }


        [HttpPut("{id:int}")]
        [Authorize] 
        public async Task<IActionResult> Update(int id, [FromBody] SuggestionUpdateDto suggestionUpdateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _suggestions.UpdateAsync(id, suggestionUpdateDto);

            return result.Status switch
            {
                AuthorizationResultStatus.Allowed => NoContent(),
                AuthorizationResultStatus.Denied_NotFound => NotFound(result.Message),
                AuthorizationResultStatus.Denied_Forbidden => Forbid(),
                _ => StatusCode(500, "Dogodila se neočekivana greška prilikom ažuriranja.")
            };
        }


        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _suggestions.DeleteAsync(id); 

            return result.Status switch
            {
                AuthorizationResultStatus.Allowed => NoContent(),
                AuthorizationResultStatus.Denied_NotFound => NotFound(result.Message),
                AuthorizationResultStatus.Denied_Forbidden => Forbid(),
                _ => StatusCode(500, "Dogodila se neočekivana greška prilikom brisanja.")
            };
        }
    }

}
