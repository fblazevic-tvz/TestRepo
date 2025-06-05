using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController : ControllerBase
    {
        private readonly IAttachmentService _attachments;
        private readonly ILogger<AttachmentsController> _logger;

        public AttachmentsController(IAttachmentService attachments, ILogger<AttachmentsController> logger)
        {
            _attachments = attachments;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Attachment>>> GetAll()
        {
            var list = await _attachments.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}", Name = "GetAttachmentById")]
        public async Task<ActionResult<Attachment>> GetById(int id)
        {
            var att = await _attachments.GetByIdAsync(id);
            if (att == null)
            {
                _logger.LogWarning("Attachment {Id} not found", id);
                return NotFound();
            }
            return Ok(att);
        }

        [HttpPost]
        public async Task<ActionResult<Attachment>> Create([FromBody] Attachment attachment)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _attachments.CreateAsync(attachment);
            return CreatedAtRoute(
                "GetAttachmentById",
                new { id = created.Id },
                created
            );
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Attachment attachment)
        {
            if (id != attachment.Id)
                return BadRequest("URL id must match body id.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ok = await _attachments.UpdateAsync(attachment);
            if (!ok) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _attachments.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
