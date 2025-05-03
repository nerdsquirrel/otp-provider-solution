namespace WebApi.Practice.Services
{
    public interface IBulkEmailService
    {
        void SendBulkEmail(List<string> recipients, string subject, string body);
    }
}
