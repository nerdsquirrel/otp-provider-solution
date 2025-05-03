using Microsoft.AspNetCore.Mvc;
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

        public OtpController(OtpSenderFactory factory, EmailServiceFactory emailFactory)
        {
            _factory = factory;
            _emailFactory = emailFactory;
        }

        [HttpGet]
        public IActionResult Get()
        {            
            return Ok("Request received.");
        }

        [HttpPost("send")]
        public IActionResult Send([FromBody] SendOtpRequest request)
        {
            var sender = _factory.GetSender(request.Method);
            sender.SendOtp(request.To, request.Otp);
            return Ok("OTP Sent");
        }

        [HttpPost("bulk")]
        public IActionResult SendBulkEmail([FromBody] BulkEmailRequest request)
        {
            //To-Do [Task]: Take the provider name from the request and use it to get the email service.
            var emailService = _emailFactory.GetEmailService();

            if (emailService is IBulkEmailService bulkSender)
            {
                bulkSender.SendBulkEmail(request.ToList, request.Subject, request.Body);
                return Ok("Bulk email sent");
            }

            return BadRequest("Bulk email not supported by the current provider.");
        }
    }
}
