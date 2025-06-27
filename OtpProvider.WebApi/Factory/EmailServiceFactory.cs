using Microsoft.Extensions.Configuration;
using WebApi.Practice.Services;

namespace WebApi.Practice.Factory
{
    public class EmailServiceFactory
    {
        private readonly IServiceProvider _provider;
        private readonly string _defaultProvider;

        public EmailServiceFactory(IServiceProvider provider, IConfiguration config)
        {
            _provider = provider;
            // read the default from appsettings.json: "EmailProvider": "Gmail" or "SendGrid"
            _defaultProvider = config["EmailProvider"] ?? "sendgrid";
        }

        public IEmailService GetEmailService(string providerName)
        {
            return providerName.ToLower() switch
            {
                "sendgrid" => _provider.GetRequiredService<SendGridEmailService>(),
                "gmail" => _provider.GetRequiredService<GmailEmailService>(),
                _ => throw new ArgumentException($"Unsupported email provider: {providerName}")
            };
        }

        // Now uses the configured default instead of hard‐coded "sendgrid"
        public IEmailService GetEmailService()
            => GetEmailService(_defaultProvider);
    }
}
