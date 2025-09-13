using System.ComponentModel.DataAnnotations;

namespace OtpProvider.WebApi.Entities
{
    public class OtpRequest
    {
        public int Id { get; set; }
        public Guid RequestId { get; set; }

        [Required]
        public string SentTo { get; set; } = string.Empty;

        public OtpMethod OtpMethod { get; set; }

        [Required, MaxLength(256)]
        public string OtpHashed { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;
        public OtpSendStatus SendStatus { get; set; } = OtpSendStatus.Pending;
        public int OtpProviderId { get; set; }
        public OtpProvider OtpProvider { get; set; } = null!;

        public DateTime VerifiedAt { get; set; }

        public int? SendByUserId { get; set; }

        public int AttemptCount { get; set; }

        public string IpAddress { get; set; } = string.Empty;

        public string DeviceInfo { get; set; } = string.Empty;

        public string ErrorMessage { get; set; } = string.Empty;

        public ApplicationUser? SendByUser { get; set; }

        public ICollection<OtpVerification> OtpVerifications { get; set; } = new List<OtpVerification>();

    }

}
