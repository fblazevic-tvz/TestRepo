using System.Security.Claims;

namespace IzjasniSe.Api.Services.Interfaces
{
    public interface ILoggedInService
    {
        ClaimsPrincipal? GetCurrentUser();
        int? GetCurrentUserId();
        bool IsCurrentUserAdminOrModerator();
        bool IsCurrentUserModerator();
        bool IsCurrentUserAdmin();

    }
}
