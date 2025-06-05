namespace IzjasniSe.Api.Dtos.Auth
{
    public class LoginResponseDto
    {
        public required string AccessToken { get; set; }
        public required string UserId { get; set; }
        public required string Username { get; set; }
        public required string Role { get; set; }
    }
}
