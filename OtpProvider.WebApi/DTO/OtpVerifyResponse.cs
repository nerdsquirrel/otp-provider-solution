namespace OtpProvider.WebApi.DTO
{
    public class OtpVerifyResponse
    {
        public bool IsSuccessful { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
