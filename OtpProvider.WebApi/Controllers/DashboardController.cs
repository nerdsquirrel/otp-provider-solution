using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.Entities;

namespace OtpProvider.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize] // Uncomment when auth pipeline is ready
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public DashboardController(ApplicationDbContext db)
        {
            _db = db;
        }

        // GET: /api/dashboard/stats?minutes=1440
        [HttpGet("stats")]
        public async Task<ActionResult<OtpStatsResponse>> GetStats([FromQuery] int minutes = 1440)
        {
            if (minutes <= 0) minutes = 60;
            if (minutes > 60 * 24 * 30) minutes = 60 * 24 * 30; // cap at ~30 days

            var fromUtc = DateTime.UtcNow.AddMinutes(-minutes);
            var baseQuery = _db.OtpRequests.AsNoTracking().Where(r => r.CreatedAt >= fromUtc);

            // Single SQL round-trip instead of parallel awaits on same DbContext (which caused the exception)
            var aggregated = await baseQuery
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalSent = g.Count(),
                    TotalVerified = g.Count(r => r.IsUsed),
                    TotalFailed = g.Count(r => r.SendStatus == OtpSendStatus.Failed),
                    TotalPending = g.Count(r => r.SendStatus == OtpSendStatus.Pending)
                })
                .FirstOrDefaultAsync();

            var totalSent = aggregated?.TotalSent ?? 0;
            var totalVerified = aggregated?.TotalVerified ?? 0;
            var totalFailed = aggregated?.TotalFailed ?? 0;
            var totalPending = aggregated?.TotalPending ?? 0;

            double successRate = totalSent == 0 ? 0d : Math.Round((double)totalVerified / totalSent, 4);

            return Ok(new OtpStatsResponse(
                RangeMinutes: minutes,
                TotalSent: totalSent,
                TotalVerified: totalVerified,
                TotalFailed: totalFailed,
                TotalPending: totalPending,
                SuccessRate: successRate,
                GeneratedAtUtc: DateTime.UtcNow.ToString("O")
            ));
        }

        // GET: /api/dashboard/recent?limit=10
        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<OtpRecentItemDto>>> GetRecent([FromQuery] int limit = 10)
        {
            limit = Math.Clamp(limit, 1, 100);

            var list = await _db.OtpRequests
                .AsNoTracking()
                .Include(r => r.OtpProvider)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .Select(r => new OtpRecentItemDto
                {
                    Id = r.RequestId,
                    Destination = r.SentTo,
                    Provider = r.OtpProvider.Name,
                    CreatedUtc = r.CreatedAt,
                    Status = r.IsUsed
                        ? "Verified"
                        : r.SendStatus.ToString()
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}