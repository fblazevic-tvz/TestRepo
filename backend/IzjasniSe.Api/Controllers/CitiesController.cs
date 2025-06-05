using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Api.Dtos;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CitiesController : ControllerBase
    {
        private readonly ICityService _cityService;
        private readonly ILogger<CitiesController> _logger;

        public CitiesController(ICityService cityService, ILogger<CitiesController> logger)
        {
            _cityService = cityService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<City>>> GetAll()
        {
            var cities = await _cityService.GetAllAsync();
            return Ok(cities);
        }

        [HttpGet("{id:int}", Name = "GetCityById")]
        public async Task<ActionResult<City>> GetById(int id)
        {
            var city = await _cityService.GetByIdAsync(id);
            if (city == null)
            {
                _logger.LogWarning("City with Id {CityId} not found.", id);
                return NotFound();
            }

            return Ok(city);
        }

        [HttpPost]
        public async Task<ActionResult<City>> Create([FromBody] City city)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdCity = await _cityService.CreateAsync(city);

            return CreatedAtRoute(
                routeName: "GetCityById",
                routeValues: new { id = createdCity.Id },
                value: createdCity
            );
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CityUpdateDto cityUpdateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _cityService.UpdateAsync(id, cityUpdateDto);
            if (!updated)
                return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _cityService.DeleteAsync(id);
            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }
}
