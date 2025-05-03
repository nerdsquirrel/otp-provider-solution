namespace WebApi.Practice.Services
{
    public abstract class BaseEmailService : IEmailService
    {
        public void SendEmail(string to, string subject, string body)
        {
            var formattedBody = FormatBody(body);
            Log(to, subject);
            Send(to, subject, formattedBody);
        }

        protected abstract void Send(string to, string subject, string formattedBody);

        protected virtual string FormatBody(string body)
        {
            return $"[Formatted Email Body]: {body}";
        }

        protected void Log(string to, string subject)
        {
            Console.WriteLine($"[Email Log] Sending to {to} with subject: {subject}");
        }
    }

}
