using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.Entities;
using OtpProvider.WebApi.Security;
using System.Security.Cryptography;
using WebApi.Practice.DTO;
using WebApi.Practice.Factory;
using WebApi.Practice.Model;
using WebApi.Practice.Services;

namespace WebApi.Practice.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OtpController : ControllerBase
    {
        private readonly OtpSenderFactory _factory;
        private readonly EmailServiceFactory _emailFactory;
        private readonly ApplicationDbContext _db;
        private const int OtpExpirySeconds = 300; // 5 minutes
        private const int MaxVerificationAttempts = 3;

        public OtpController(OtpSenderFactory factory, EmailServiceFactory emailFactory, ApplicationDbContext db)
        {
            _factory = factory;
            _emailFactory = emailFactory;
            _db = db;
        }

        [HttpGet]
        public IActionResult Get()
        {
            return Ok("Request received.");
        }

        [HttpPost("send")]
        // [Authorize(Roles = "User")]
        [ProducesResponseType(typeof(SendOtpResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<SendOtpResponse>> Send([FromBody] SendOtpRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new SendOtpResponse
                {
                    IsSent = false,
                    ErrorMessage = "Invalid request."
                });
            }

            var rawOtp = RandomNumberGenerator.GetInt32(0, 10000).ToString("D4");
            var hashedOtp = SecurityHashing.HashOtp(rawOtp);

            var provider = await _db.OtpProviders
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.IsActive && p.DeliveryType == request.Method);

            if (provider is null)
            {
                return BadRequest(new SendOtpResponse
                {
                    IsSent = false,
                    ErrorMessage = "No active OTP provider available for the specified method."
                });
            }

            var now = DateTime.UtcNow;
            var otpRequest = new OtpRequest
            {
                RequestId = Guid.NewGuid(),
                SentTo = request.To,
                OtpMethod = request.Method,
                OtpHashed = hashedOtp,
                CreatedAt = now,
                ExpiresAt = now.AddSeconds(OtpExpirySeconds),
                IsUsed = false,
                SendStatus = OtpSendStatus.Pending,
                OtpProviderId = provider.Id,
                AttemptCount = 0,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                DeviceInfo = Request.Headers.UserAgent.ToString(),
                ErrorMessage = string.Empty
            };

            _db.OtpRequests.Add(otpRequest);
            await _db.SaveChangesAsync();

            bool sendSucceeded = false;
            string? sendError = null;

            try
            {
                var sender = _factory.GetSender(request.Method);
                // CHANGED: capture result of provider send instead of assuming success
                sendSucceeded = await sender.SendOtp(request.To, rawOtp);
                otpRequest.SendStatus = sendSucceeded ? OtpSendStatus.Success : OtpSendStatus.Failed;
                if (!sendSucceeded)
                {
                    sendError = "Provider reported failure.";
                    otpRequest.ErrorMessage = sendError;
                }
            }
            catch (Exception ex)
            {
                sendError = ex.Message;
                otpRequest.SendStatus = OtpSendStatus.Failed;
                otpRequest.ErrorMessage = ex.Message;
            }

            _db.OtpRequests.Update(otpRequest);
            await _db.SaveChangesAsync();

            return Ok(new SendOtpResponse
            {
                RequestId = otpRequest.RequestId,
                OtpExpirySeconds = OtpExpirySeconds,
                IsSent = sendSucceeded,
                ErrorMessage = sendError
            });
        }

        [HttpPost("verify")]
        //[Authorize(Roles = "User")]
        [ProducesResponseType(typeof(OtpVerifyResponse), StatusCodes.Status200OK)]
        public async Task<ActionResult<OtpVerifyResponse>> Verify([FromBody] OtpVerifyRequest request, CancellationToken ct)
        {
            if (request.RequestId == Guid.Empty || string.IsNullOrWhiteSpace(request.Otp))
            {
                return BadRequest(new OtpVerifyResponse
                {
                    IsSuccessful = false,
                    ErrorMessage = "RequestId and Otp are required."
                });
            }

            var otpRequest = await _db.OtpRequests
                .Include(r => r.OtpVerifications)
                .FirstOrDefaultAsync(r => r.RequestId == request.RequestId, ct);

            if (otpRequest is null)
            {
                return NotFound(new OtpVerifyResponse
                {
                    IsSuccessful = false,
                    ErrorMessage = "OTP request not found."
                });
            }

            var now = DateTime.UtcNow;
            var verification = new OtpVerification
            {
                OtpRequestId = otpRequest.Id,
                ProvidedOtpHashed = SecurityHashing.HashOtp(request.Otp),
                AttemptedAtUtc = now,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty,
                DeviceInfo = Request.Headers.UserAgent.ToString()
            };

            if (otpRequest.SendStatus != OtpSendStatus.Success)
            {
                verification.IsSuccessful = false;
                verification.FailureReason = OtpFailureReason.ProviderError;
                otpRequest.AttemptCount++;
                _db.OtpVerifications.Add(verification);
                await _db.SaveChangesAsync(ct);
                return Ok(new OtpVerifyResponse { IsSuccessful = false, ErrorMessage = "OTP not deliverable." });
            }

            if (otpRequest.IsUsed)
            {
                verification.IsSuccessful = false;
                verification.FailureReason = OtpFailureReason.AlreadyUsed;
                otpRequest.AttemptCount++;
                _db.OtpVerifications.Add(verification);
                await _db.SaveChangesAsync(ct);
                return Ok(new OtpVerifyResponse { IsSuccessful = false, ErrorMessage = "OTP already used." });
            }

            if (now > otpRequest.ExpiresAt)
            {
                verification.IsSuccessful = false;
                verification.FailureReason = OtpFailureReason.Expired;
                otpRequest.AttemptCount++;
                _db.OtpVerifications.Add(verification);
                await _db.SaveChangesAsync(ct);
                return Ok(new OtpVerifyResponse { IsSuccessful = false, ErrorMessage = "OTP expired." });
            }

            if (otpRequest.AttemptCount >= MaxVerificationAttempts)
            {
                verification.IsSuccessful = false;
                verification.FailureReason = OtpFailureReason.LockedOut;
                _db.OtpVerifications.Add(verification);
                await _db.SaveChangesAsync(ct);
                return Ok(new OtpVerifyResponse { IsSuccessful = false, ErrorMessage = "Maximum attempts exceeded." });
            }

            if (!SecurityHashing.VerifyOtp(request.Otp, otpRequest.OtpHashed))
            {
                verification.IsSuccessful = false;
                verification.FailureReason = OtpFailureReason.InvalidOtp;
                otpRequest.AttemptCount++;
                _db.OtpVerifications.Add(verification);
                await _db.SaveChangesAsync(ct);
                return Ok(new OtpVerifyResponse { IsSuccessful = false, ErrorMessage = "Invalid OTP." });
            }

            verification.IsSuccessful = true;
            otpRequest.IsUsed = true;
            otpRequest.VerifiedAt = now;
            otpRequest.AttemptCount++;
            _db.OtpVerifications.Add(verification);
            _db.OtpRequests.Update(otpRequest);
            await _db.SaveChangesAsync(ct);

            return Ok(new OtpVerifyResponse { IsSuccessful = true });
        }

        [HttpPost("bulk")]
        [Authorize(Roles = "Admin")]
        public IActionResult SendBulkEmail([FromBody] BulkEmailRequest request)
        {
            var emailService = _emailFactory.GetEmailService(request.Provider);
            if (emailService is IBulkEmailService bulkSender)
            {
                bulkSender.SendBulkEmail(request.ToList, request.Subject, request.Body);
                return Ok("Bulk email sent");
            }
            return BadRequest("Bulk email not supported by the current provider.");
        }
    }
}
