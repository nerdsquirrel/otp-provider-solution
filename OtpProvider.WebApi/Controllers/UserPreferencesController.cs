using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.Entities;
using System.Security.Claims;

namespace OtpProvider.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class UserPreferencesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public UserPreferencesController(ApplicationDbContext db)
        {
            _db = db;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }

        private static UserOtpPreferencesResponse Map(UserOtpPreference e) => new()
        {
            OtpLength = e.OtpLength,
            CharacterSet = e.CharacterSet,
            ExpirationSeconds = e.ExpirationSeconds,
            MaxVerificationAttempts = e.MaxVerificationAttempts,
            RetryDelaySeconds = e.RetryDelaySeconds,
            PreferredChannel = e.PreferredChannel,
            PreferredProviderId = e.PreferredProviderId,
            UpdatedAtUtc = e.UpdatedAtUtc
        };

        private async Task<UserOtpPreference> CreateDefaultAsync(int userId)
        {
            // Attempt to pick first active provider for default channel (SMS)
            var providerId = await _db.OtpProviders
                .Where(p => p.DeliveryType == OtpMethod.SMS && p.IsActive)
                .OrderBy(p => p.Name)
                .Select(p => p.Id)
                .FirstOrDefaultAsync();

            return new UserOtpPreference
            {
                UserId = userId,
                OtpLength = 4,
                CharacterSet = OtpCharacterSet.Numeric,
                ExpirationSeconds = 300,
                MaxVerificationAttempts = 3,
                RetryDelaySeconds = 30,
                PreferredChannel = OtpMethod.SMS,
                PreferredProviderId = providerId > 0 ? providerId : 0 // 0 denotes "not set" (client must choose)
            };
        }

        [HttpGet]
        public async Task<ActionResult<UserOtpPreferencesResponse>> Get()
        {
            var userId = GetCurrentUserId() ?? 2;
            var entity = await _db.UserOtpPreferences
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (entity is null)
            {
                var defaults = await CreateDefaultAsync(userId);
                return Ok(Map(defaults));
            }
            return Ok(Map(entity));
        }

        [HttpPut]
        public async Task<ActionResult<UserOtpPreferencesResponse>> Upsert([FromBody] UserOtpPreferencesDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var userId = GetCurrentUserId() ?? 2;

            // Validate provider belongs to channel and active (required now)
            var valid = await _db.OtpProviders
                .AnyAsync(p => p.Id == dto.PreferredProviderId
                               && p.DeliveryType == dto.PreferredChannel
                               && p.IsActive);

            if (!valid)
                return BadRequest("PreferredProviderId is invalid for the selected channel or inactive.");

            var entity = await _db.UserOtpPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (entity is null)
            {
                entity = new UserOtpPreference { UserId = userId };
                _db.UserOtpPreferences.Add(entity);
            }

            entity.OtpLength = dto.OtpLength;
            entity.CharacterSet = dto.CharacterSet;
            entity.ExpirationSeconds = dto.ExpirationSeconds;
            entity.MaxVerificationAttempts = dto.MaxVerificationAttempts;
            entity.RetryDelaySeconds = dto.RetryDelaySeconds;
            entity.PreferredChannel = dto.PreferredChannel;
            entity.PreferredProviderId = dto.PreferredProviderId;
            entity.UpdatedAtUtc = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(Map(entity));
        }
    }
}