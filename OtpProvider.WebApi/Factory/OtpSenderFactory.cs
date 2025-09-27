using OtpProvider.WebApi.Entities;
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

        public IOtpSender GetSender(OtpMethod method)
        {
            return method switch
            {
                OtpMethod.SMS => _provider.GetRequiredService<SmsOtpSender>(),
                OtpMethod.Email => new EmailOtpSender(_emailFactory.GetDefaultEmailService()),
                OtpMethod.WhatsApp => _provider.GetRequiredService<WhatsAppOtpSender>(),
                _ => throw new Exception("Invalid OTP method")
            };
        }
    }
}
