using System.ComponentModel.DataAnnotations;

namespace OtpProvider.WebApi.Entities
{
    public class OtpVerification
    {
        public int Id { get; set; }

        [Required, MaxLength(256)]
        public string ProvidedOtpHashed { get; set; } = string.Empty;
        public bool IsSuccessful { get; set; }
        public DateTime AttemptedAtUtc { get; set; } = DateTime.UtcNow;
        public OtpFailureReason FailureReason { get; set; }
        public int OtpRequestId { get; set; }
        public OtpRequest OtpRequest { get; set; } = null!;
        public string IpAddress { get; set; } = string.Empty;
        public string DeviceInfo { get; set; } = string.Empty;
    }
}
