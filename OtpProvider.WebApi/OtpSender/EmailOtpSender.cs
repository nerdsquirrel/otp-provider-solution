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

        public void SendOtp(string destination, string message)
        {
            _emailService.SendEmail(destination, "Your OTP Code", message);
        }
    }

}
