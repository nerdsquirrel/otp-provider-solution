using System;

namespace OtpProvider.WebApi.DTO
{
    public record OtpStatsResponse(
        int RangeMinutes,
        int TotalSent,
        int TotalVerified,
        int TotalFailed,
        int TotalPending,
        double SuccessRate,
        string GeneratedAtUtc
    );

    public record OtpRecentItemDto
    {
        public Guid Id { get; init; }
        public string Destination { get; init; } = string.Empty;
        public string Provider { get; init; } = string.Empty;
        public DateTime CreatedUtc { get; init; }
        public string Status { get; init; } = string.Empty;
    }
}