namespace OtpProvider.WebApi.OtpSender
{
    public interface IOtpSender
    {
        void SendOtp(string destination, string message);
    }
}
