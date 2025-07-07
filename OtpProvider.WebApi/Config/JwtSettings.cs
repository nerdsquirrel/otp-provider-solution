namespace OtpProvider.WebApi.Config
{
    public class JwtSettings
    {
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
        public int TokenExpirationMinutes { get; set; } = 30; // Default to 1 hour
    }
}
