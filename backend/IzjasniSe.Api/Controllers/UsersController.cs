using Microsoft.AspNetCore.Mvc;
using IzjasniSe.Model.Entities;
using IzjasniSe.Api.Dtos;
using Microsoft.AspNetCore.Identity;
using IzjasniSe.Api.Services.Interfaces;
using IzjasniSe.Model.Enums;
using Microsoft.AspNetCore.Authorization;
using IzjasniSe.Api.Services;

namespace IzjasniSe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _users;
        private readonly ILogger<UsersController> _logger;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly ILoggedInService _loggedInService;
        private readonly IFileUploadService _fileUploadService;

        public UsersController(IUserService users, ILogger<UsersController> logger, ILoggedInService loggedInService, IFileUploadService fileUploadService)
        {
            _users = users;
            _logger = logger;
            _passwordHasher = new PasswordHasher<User>();
            _loggedInService = loggedInService;
            _fileUploadService = fileUploadService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserReadDto>>> GetAll()
        {
            var list = await _users.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id:int}", Name = "GetUserById")]
        [Authorize]
        public async Task<ActionResult<UserReadDto>> GetById(int id)
        {
            var user = await _users.GetByIdAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User {Id} not found", id);
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserReadDto>> Create([FromBody] UserCreateDto userCreateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var isUnique = await _users.CheckUniqueness(userCreateDto.UserName, userCreateDto.Email);

            if (!isUnique)
            {
                ModelState.AddModelError("UserName", "Username or email already exists.");
                return BadRequest(ModelState);
            }

            var created = await _users.CreateAsync(userCreateDto);


            return CreatedAtRoute(
                "GetUserById",
                new { id = created.Id },
                created
            );
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDto userUpdateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var isUnique = await _users.CheckUniqueness(null, userUpdateDto.Email);

            if (!isUnique)
            {
                ModelState.AddModelError("Email", "Email already exists.");
                return BadRequest(ModelState);
            }

            var ok = await _users.UpdateAsync(id, userUpdateDto);
            if (!ok) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _users.DeleteAsync(id);
            if (!ok) return NotFound();

            return NoContent();
        }

        [HttpPatch("status/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserStatus(int id, [FromBody] ChangeUserStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _users.ChangeStatusAsync(id, dto.Status);
            if (!success)
                return NotFound();

            return NoContent();
        }

        [HttpPost("{id:int}/avatar")]
        [Authorize]
        public async Task<IActionResult> UpdateAvatar(int id, [FromForm] UserAvatarUpdateDto dto)
        {
            var currentUserId = _loggedInService.GetCurrentUserId();
            if (currentUserId != id)
            {
                return Forbid();
            }

            try
            {
                var avatarUrl = await _fileUploadService.UploadAvatarAsync(dto.Avatar, id);
                var success = await _users.UpdateAvatarAsync(id, avatarUrl);

                if (!success)
                    return NotFound();

                return Ok(new { avatarUrl });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
