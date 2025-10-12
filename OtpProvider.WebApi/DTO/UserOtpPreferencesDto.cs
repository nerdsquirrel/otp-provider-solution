using System.ComponentModel.DataAnnotations;
using OtpProvider.WebApi.Entities;

namespace OtpProvider.WebApi.DTO
{
    public class UserOtpPreferencesDto
    {
        [Range(4, 8)]
        public int OtpLength { get; set; }

        public OtpCharacterSet CharacterSet { get; set; }

        [Range(10, 3600)]
        public int ExpirationSeconds { get; set; }

        [Range(1, 10)]
        public int MaxVerificationAttempts { get; set; }

        [Range(0, 1800)]
        public int RetryDelaySeconds { get; set; }

        [Required]
        public OtpMethod PreferredChannel { get; set; }

        [Required, Range(1, int.MaxValue)]
        public int PreferredProviderId { get; set; }
    }

    public class UserOtpPreferencesResponse : UserOtpPreferencesDto
    {
        public DateTime UpdatedAtUtc { get; set; }
    }
}