using Microsoft.Extensions.Options;
using OtpProvider.WebApi.DTO;
using System.Net;
using System.Net.Mail;
using WebApi.Practice.Model;
using WebApi.Practice.Services;

namespace WebApi.Practice.Services
{
    public class GmailEmailService : BaseEmailService, IBulkEmailService
    {
        private readonly GmailSetting _settings;

        public GmailEmailService(IOptions<GmailSetting> options)
        {
            _settings = options.Value;
        }

        protected override void Send(string to, string subject, string formattedBody)
        {
            var fromAddress = new MailAddress(_settings.FromAddress, _settings.FromName);
            var toAddress = new MailAddress(to);

            using var smtp = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromAddress.Address, _settings.AppPassword)
            };

            using var message = new MailMessage(fromAddress, toAddress)
            {
                Subject = subject,
                Body = formattedBody
            };

            smtp.Send(message);
            Console.WriteLine($"[Gmail] To: {to} | Subject: {subject}");
        }

        public void SendBulkEmail(List<string> recipients, string subject, string body)
        {
            foreach (var recipient in recipients)
            {
                // Reuse the BaseEmailService’s SendEmail logic
                SendEmail(recipient, subject, body);
            }
        }
        protected override string FormatBody(string body)
        {
            return body;   
        }
    }
}
