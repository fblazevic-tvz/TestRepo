using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NoticesController : ControllerBase
    {
        private readonly INoticeService _notices;
        private readonly ILogger<NoticesController> _logger;

        public NoticesController(INoticeService notices, ILogger<NoticesController> logger)
        {
            _notices = notices;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Notice>>> GetAll()
        {
            var list = await _notices.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}", Name = "GetNoticeById")]
        public async Task<ActionResult<Notice>> GetById(int id)
        {
            var notice = await _notices.GetByIdAsync(id);
            if (notice == null)
            {
                _logger.LogWarning("Notice {Id} not found", id);
                return NotFound();
            }
            return Ok(notice);
        }

        [HttpGet("byProposal/{proposalId:int}")]
        public async Task<ActionResult<IEnumerable<Notice>>> GetByProposal(int proposalId)
        {
            _logger.LogInformation("Fetching notices for Proposal ID: {ProposalId}", proposalId);
            var list = await _notices.GetByProposalIdAsync(proposalId);
            return Ok(list);
        }

        [HttpPost]
        [Authorize(Roles = "Moderator")]
        public async Task<ActionResult<Notice>> Create([FromBody] NoticeCreateDto noticeCreateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _notices.CreateAsync(noticeCreateDto);
            if (created == null)
            {
                ModelState.AddModelError("NoticeCreation", "The creation of the notice failed.");
                return BadRequest(ModelState);
            }
            return CreatedAtRoute(
                "GetNoticeById",
                new { id = created.Id },
                created
            );
        }

        [HttpPut("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] NoticeUpdateDto noticeUpdateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ok = await _notices.UpdateAsync(id, noticeUpdateDto);
            if (!ok) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _notices.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
