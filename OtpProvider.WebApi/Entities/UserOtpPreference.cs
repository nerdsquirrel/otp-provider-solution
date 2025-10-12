using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace OtpProvider.WebApi.Entities
{
    public enum OtpCharacterSet
    {
        Numeric = 0,
        Alphanumeric = 1
    }

    public class UserOtpPreference
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Range(4, 8)]
        public int OtpLength { get; set; } = 4;

        public OtpCharacterSet CharacterSet { get; set; } = OtpCharacterSet.Numeric;

        [Range(10, 3600)]
        public int ExpirationSeconds { get; set; } = 300;

        [Range(1, 10)]
        public int MaxVerificationAttempts { get; set; } = 3;

        [Range(0, 1800)]
        public int RetryDelaySeconds { get; set; } = 30;

        public OtpMethod PreferredChannel { get; set; } = OtpMethod.SMS;

        public int PreferredProviderId { get; set; }

        public OtpProvider? PreferredProvider { get; set; }

        public ApplicationUser? User { get; set; }

        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}