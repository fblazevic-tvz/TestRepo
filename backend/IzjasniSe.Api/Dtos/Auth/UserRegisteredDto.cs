namespace IzjasniSe.Api.Dtos.Auth
{
    public class UserRegisteredDto
    {
        public int UserId { get; set; } 
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
    }
}
