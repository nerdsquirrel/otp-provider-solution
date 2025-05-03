namespace WebApi.Practice.Services
{
    public class GmailEmailService : BaseEmailService
    {
        // TODO [Task]: Implement gmail API integration here.
        protected override void Send(string to, string subject, string formattedBody)
        {
            Console.WriteLine($"[Gmail] To: {to} | Subject: {subject} | Body: {formattedBody}");
        }
    }
}
