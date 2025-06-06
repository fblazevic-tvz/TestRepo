using System.Security.Claims;
using IzjasniSe.Api.Services.Interfaces;

namespace IzjasniSe.Api.Services
{
    public class LoggedInService : ILoggedInService
    {
        private readonly ILogger _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LoggedInService(ILogger<LoggedInService> logger, IHttpContextAccessor httpContextAccessor)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public ClaimsPrincipal? GetCurrentUser()
        {
            return _httpContextAccessor.HttpContext?.User;
        }

         public int? GetCurrentUserId()
        {
            var user = GetCurrentUser();
            if (user?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Could not parse User ID claim: {ClaimValue}", userIdClaim);
                return null;
            }
            return userId;
        }

        public bool IsCurrentUserAdminOrModerator()
        {
            var user = GetCurrentUser();
            if (user?.Identity?.IsAuthenticated != true)
            {
                return false;
            }
            return user.IsInRole("Admin") || user.IsInRole("Moderator");
        }

        public bool IsCurrentUserModerator()
        {
            var user = GetCurrentUser();
            if (user?.Identity?.IsAuthenticated != true)
            {
                return false;
            }
            return user.IsInRole("Moderator");
        }
        public bool IsCurrentUserAdmin()
        {
            var user = GetCurrentUser();
            if (user?.Identity?.IsAuthenticated != true)
            {
                return false;
            }
            return user.IsInRole("Admin");
        }

    }
}
