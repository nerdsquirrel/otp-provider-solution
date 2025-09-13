namespace OtpProvider.WebApi.Entities
{
    public enum OtpFailureReason
    {
        Expired,
        AlreadyUsed,
        InvalidOtp,
        ProviderError,
        LockedOut,
        Unknown
    }
}
