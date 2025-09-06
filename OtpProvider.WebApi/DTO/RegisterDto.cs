namespace OtpProvider.WebApi.DTO
{
    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty; // required, max 25 (validated in service)
        public string Email { get; set; } = string.Empty;    // required
        public string Password { get; set; } = string.Empty; // required
    }
}