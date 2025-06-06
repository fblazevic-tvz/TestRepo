using IzjasniSe.Api.Dtos.Auth;
using IzjasniSe.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace IzjasniSe.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
    {
        private CookieOptions GetRefreshTokenCookieOptions()
        {
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            };
        }


        [HttpPost("register")]
        [ProducesResponseType(typeof(UserRegisteredDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserRegisteredDto>> Register(RegisterRequestDto request)
        {
            logger.LogInformation("Registration request received for username: {Username}", request.Username);
            var user = await authService.RegisterAsync(request);

            if (user is null)
            {
                logger.LogWarning("Registration failed for username {Username}. Already exists or other error.", request.Username);
                return BadRequest("Korisničko ime ili email već postoje.");
            }

            logger.LogInformation("Registration successful, user ID: {UserId}", user.Id);
            var resultDto = new UserRegisteredDto
            {
                UserId = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Role = user.Role.ToString()
            };
            return Ok(resultDto);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LoginResponseDto>> Login(UserDto request)
        {
            logger.LogInformation("Login request received for username: {Username}", request.Username);
            var result = await authService.LoginAsync(request);

            if (result is null || result.Value.User is null || result.Value.Tokens is null)
            {
                logger.LogWarning("Login failed for username {Username}. Invalid credentials or inactive account.", request.Username);
                return BadRequest("Neispravno korisničko ime ili lozinka, ili je račun neaktivan.");
            }

            var (user, tokens) = result.Value;

            logger.LogInformation("Setting refresh token cookie for user ID: {UserId}", user.Id);
            Response.Cookies.Append("refreshToken", tokens.RefreshToken, GetRefreshTokenCookieOptions());

            var responseDto = new LoginResponseDto
            {
                AccessToken = tokens.AccessToken,
                UserId = user.Id.ToString(),
                Username = user.UserName,
                Role = user.Role.ToString()
            };

            logger.LogInformation("Login successful, returning access token and user info for {Username}", user.UserName);
            return Ok(responseDto);
        }

        [HttpPost("refresh-token")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken()
        {
            logger.LogInformation("Refresh token request received.");
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                logger.LogWarning("Refresh token request failed: No refresh token cookie found.");
                return Unauthorized("Refresh token not found.");
            }

            var result = await authService.RefreshTokensAsync(refreshToken);

            if (result is null)
            {
                logger.LogWarning("Refresh token request failed: Service returned null (token invalid or expired).");
                return Unauthorized("Invalid or expired refresh token.");
            }

            logger.LogInformation("Refresh token success. Setting new cookie and returning new access token.");

            Response.Cookies.Append("refreshToken", result.RefreshToken, GetRefreshTokenCookieOptions());

            return Ok(new { AccessToken = result.AccessToken });
        }

        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Logout()
        {
            logger.LogInformation("Logout request received.");

            logger.LogInformation("Deleting refresh token cookie.");

            Response.Cookies.Delete("refreshToken", GetRefreshTokenCookieOptions());
            return Ok("Uspješno ste se odjavili");
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var username = User.FindFirstValue(JwtRegisteredClaimNames.Name);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId))
            {
                logger.LogError("GetCurrentUser called but user ID claim (NameIdentifier) is missing.");
                return Unauthorized();
            }

            logger.LogInformation("Returning current user info for User ID: {UserId}", userId);
            return Ok(new
            {
                UserId = userId,
                Username = username,
                Role = role
            });
        }


        [Authorize]
        [HttpGet("authenticated-only")]
        public IActionResult AuthenticatedOnlyEndpoint()
        {
            return Ok("You are authenticated!");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnlyEndpoint()
        {
            return Ok("You are an admin!");
        }
    }
}