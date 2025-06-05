using IzjasniSe.DAL;
using IzjasniSe.Model.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using IzjasniSe.Model.Enums;
using IzjasniSe.Api.Dtos.Auth;

namespace IzjasniSe.Api.Services
{
    public class AuthService(AppDbContext context, IConfiguration configuration, ILogger<AuthService> logger) : IAuthService
    {
        public async Task<(User? User, TokenResponseDto? Tokens)?> LoginAsync(UserDto request)
        {
            logger.LogInformation("Attempting login for user: {Username}", request.Username);
            var user = await context.Users.FirstOrDefaultAsync(u => u.UserName == request.Username);

            if (user is null)
            {
                logger.LogWarning("Login failed: User {Username} not found.", request.Username);
                return null;
            }

            if (user.AccountStatus != UserAccountStatus.Active)
            {
                logger.LogWarning("Login failed: User {Username} account is not active (Status: {Status}).", request.Username, user.AccountStatus);
                return null;
            }

            var passwordHasher = new PasswordHasher<User>();
            if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            {
                logger.LogWarning("Login failed: Invalid password for user {Username}.", request.Username);
                return null;
            }

            logger.LogInformation("Login successful for user: {Username}", request.Username);
            var tokens = await CreateTokenResponse(user);
            return (user, tokens);
        }

        public async Task<User?> RegisterAsync(RegisterRequestDto request)
        {
            logger.LogInformation("Attempting registration for username: {Username}, email: {Email}", request.Username, request.Email);
            if (await context.Users.AnyAsync(u => u.UserName == request.Username || u.Email == request.Email))
            {
                logger.LogWarning("Registration failed: Username {Username} or Email {Email} already exists.", request.Username, request.Email);
                return null;
            }

            var user = new User
            {
                UserName = request.Username,
                Email = request.Email,
                Role = UserRole.Regular,
                AccountStatus = UserAccountStatus.Active
            };

            var passwordHasher = new PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

            context.Users.Add(user);
            await context.SaveChangesAsync();
            logger.LogInformation("Registration successful for user: {Username}", request.Username);

            return user;
        }

        public async Task<TokenResponseDto?> RefreshTokensAsync(string refreshToken)
        {
            logger.LogInformation("Attempting token refresh.");
            if (string.IsNullOrEmpty(refreshToken))
            {
                logger.LogWarning("Refresh token failed: Token string was null or empty.");
                return null;
            }

            var user = await context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user is null)
            {
                logger.LogWarning("Refresh token failed: No user found with the provided token.");
                return null;
            }

            if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                logger.LogWarning("Refresh token failed: Token expired for user {Username}.", user.UserName);
                return null;
            }

            logger.LogInformation("Refresh token validated successfully for user: {Username}. Generating new tokens.", user.UserName);
            return await CreateTokenResponse(user);
        }

        private async Task<TokenResponseDto> CreateTokenResponse(User user)
        {
            ArgumentNullException.ThrowIfNull(user);

            return new TokenResponseDto
            {
                AccessToken = CreateAccessToken(user),
                RefreshToken = await GenerateAndSaveRefreshTokenAsync(user)
            };
        }

        private async Task<string> GenerateAndSaveRefreshTokenAsync(User user)
        {
            var refreshToken = GenerateRefreshTokenString();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(configuration.GetValue<int>("AppSettings:RefreshTokenValidityDays", 7));
            await context.SaveChangesAsync();
            return refreshToken;
        }

        private string CreateAccessToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Email, user.Email), 
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),

                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var tokenKey = configuration["AppSettings:Token"];
            if (string.IsNullOrEmpty(tokenKey))
            {
                logger.LogError("AppSettings:Token configuration is missing or empty.");
                throw new InvalidOperationException("JWT signing key is not configured.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var expiry = DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("AppSettings:AccessTokenValidityMinutes", 60));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = expiry,
                Issuer = configuration["AppSettings:Issuer"],
                Audience = configuration["AppSettings:Audience"],
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshTokenString()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}