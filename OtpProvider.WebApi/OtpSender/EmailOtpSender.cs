using WebApi.Practice.Services;

namespace OtpProvider.WebApi.OtpSender
{
    public class EmailOtpSender : IOtpSender
    {
        private readonly IEmailService _emailService;

        public EmailOtpSender(IEmailService emailService)
        {
            _emailService = emailService;
        }

        public Task<bool> SendOtp(string destination, string message)
        {
            try
            {
                _emailService.SendEmail(destination, "Your OTP Code", message);
                return Task.FromResult(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailOTP] Send failed: {ex.Message}");
                return Task.FromResult(false);
            }
        }
    }
}
