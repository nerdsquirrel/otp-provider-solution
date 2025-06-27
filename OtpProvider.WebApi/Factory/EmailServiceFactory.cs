using WebApi.Practice.Services;

namespace WebApi.Practice.Factory
{
    public class EmailServiceFactory
    {
        private readonly IServiceProvider _provider;
        private readonly string _defaultProviderName;

        public EmailServiceFactory(IServiceProvider provider, IConfiguration config)
        {
            _provider = provider;
            _defaultProviderName = config["EmailProvider"] ?? "gmail";
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
        public IEmailService GetDefaultEmailService()
            => GetEmailService(_defaultProviderName);
    }
}
