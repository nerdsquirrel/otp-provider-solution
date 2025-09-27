namespace OtpProvider.WebApi.OtpSender
{
    public interface IOtpSender
    {
        /// <summary>
        /// Sends an OTP message to the destination.
        /// Returns true when the provider reports success, otherwise false.
        /// Implementations should throw only for unexpected/unrecoverable errors (e.g. configuration).
        /// </summary>
        Task<bool> SendOtp(string destination, string message);
    }
}
