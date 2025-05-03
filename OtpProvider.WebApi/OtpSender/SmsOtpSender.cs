namespace OtpProvider.WebApi.OtpSender
{
    public class SmsOtpSender : IOtpSender
    {
        public void SendOtp(string destination, string message)
        {
            Console.WriteLine($"[SMS] OTP sent to {destination}: {message}");
        }
    }
}
