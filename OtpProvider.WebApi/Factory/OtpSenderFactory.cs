using OtpProvider.WebApi.OtpSender;

namespace WebApi.Practice.Factory
{
    public class OtpSenderFactory
    {
        private readonly IServiceProvider _provider;
        private readonly EmailServiceFactory _emailFactory;

        public OtpSenderFactory(IServiceProvider provider, EmailServiceFactory emailFactory)
        {
            _provider = provider;
            _emailFactory = emailFactory;
        }

        public IOtpSender GetSender(string method)
        {
            return method.ToLower() switch
            {
                "sms" => _provider.GetRequiredService<SmsOtpSender>(),
                "email" => new EmailOtpSender(_emailFactory.GetEmailService()),
                _ => throw new Exception("Invalid OTP method")
            };
        }
    }
}
