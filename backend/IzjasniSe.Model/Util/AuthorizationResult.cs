using IzjasniSe.Model.Enums;

namespace IzjasniSe.Model.Util
{
    public record AuthorizationResult(AuthorizationResultStatus Status, string? Message = null);
}
