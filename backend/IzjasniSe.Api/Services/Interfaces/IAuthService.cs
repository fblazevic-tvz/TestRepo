using IzjasniSe.Api.Dtos;
using IzjasniSe.Api.Dtos.Auth;
using IzjasniSe.Model.Entities;

namespace IzjasniSe.Api.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterRequestDto request);

        Task<(User? User, TokenResponseDto? Tokens)?> LoginAsync(UserDto request);

        Task<TokenResponseDto?> RefreshTokensAsync(string refreshToken);
    }
}
