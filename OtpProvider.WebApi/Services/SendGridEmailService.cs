namespace WebApi.Practice.Services
{
    public class SendGridEmailService : BaseEmailService, IBulkEmailService
    {
        protected override void Send(string to, string subject, string formattedBody)
        {
            Console.WriteLine($"[SendGrid] To: {to} | Subject: {subject} | Body: {formattedBody}");
        }

        protected override string FormatBody(string body)
        {
            return $"[Formatted Email Body]: {body}";
        }

        public void SendBulkEmail(List<string> recipients, string subject, string body)
        {
            foreach (var recipient in recipients)
            {
                var formattedBody = FormatBody(body);
                Log(recipient, subject);
                Console.WriteLine($"[SendGrid - Bulk] To: {recipient} | Subject: {subject} | Body: {formattedBody}");
            }
        }
    }
}
