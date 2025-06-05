using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Dtos;
using IzjasniSe.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locations;
        private readonly ILogger<LocationsController> _logger;

        public LocationsController(ILocationService locations, ILogger<LocationsController> logger)
        {
            _locations = locations;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Location>>> GetAll()
        {
            var list = await _locations.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}", Name = "GetLocationById")]
        public async Task<ActionResult<Location>> GetById(int id)
        {
            var loc = await _locations.GetByIdAsync(id);
            if (loc == null)
            {
                _logger.LogWarning("Location {Id} not found", id);
                return NotFound();
            }
            return Ok(loc);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Location>> Create([FromBody] LocationCreateDto locationCreateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _locations.CreateAsync(locationCreateDto);

            return CreatedAtRoute("GetLocationById", new { id = created.Id }, created);
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] LocationCreateDto locationCreateDto)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ok = await _locations.UpdateAsync(id,locationCreateDto);
            if (!ok) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _locations.DeleteAsync(id);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}
