namespace OtpProvider.WebApi.DTO
{
    public class OtpVerifyRequest
    {
        public Guid RequestId { get; set; }
        public string Otp { get; set; } = string.Empty;
    }
}
