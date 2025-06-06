using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Model.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProposalsController : ControllerBase
    {
        private readonly IProposalService _proposals;
        private readonly ILogger<ProposalsController> _logger;

        public ProposalsController(IProposalService proposals, ILogger<ProposalsController> logger)
        {
            _proposals = proposals;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Proposal>>> GetAll()
        {
            var list = await _proposals.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}", Name = "GetProposalById")]
        public async Task<ActionResult<Proposal>> GetById(int id)
        {
            var prop = await _proposals.GetByIdAsync(id);
            if (prop == null)
            {
                _logger.LogWarning("Proposal {Id} not found", id);
                return NotFound();
            }
            return Ok(prop);
        }

        [HttpGet("moderator/{moderatorId:int}", Name = "GetProposalByModeratorId")]
        [Authorize(Roles ="Moderator")]
        public async Task<ActionResult<IEnumerable<Proposal>>> GetByModeratorId(int moderatorId)
        {
            var prop = await _proposals.GetByModeratorIdAsync(moderatorId);
            if (prop == null || !prop.Any())
            {
                _logger.LogWarning("No proposals found for moderator id: {id}", moderatorId);
                return NotFound();
            }
            return Ok(prop);
        }

        [HttpPost]
        [Authorize(Roles = "Moderator")]
        public async Task<ActionResult<Proposal>> Create([FromBody] ProposalCreateDto proposalCreateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _proposals.CreateAsync(proposalCreateDto);
            if(created == null)
            {
                ModelState.AddModelError(
                    "ProposalCreating",
                    "The creation of the proposal failed.");
                return BadRequest(ModelState);
            }
            return CreatedAtRoute(
                "GetProposalById",
                new { id = created.Id },
                created
            );
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> Update(int id, [FromBody] ProposalUpdateDto proposalUpdateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ok = await _proposals.UpdateAsync(id, proposalUpdateDto);
            if (!ok) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Moderator")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _proposals.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
