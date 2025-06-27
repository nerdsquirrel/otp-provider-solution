using System.ComponentModel.DataAnnotations;

namespace WebApi.Practice.Model
{
    public enum OtpMethod
    {
        Sms,
        Email
    }
    public class SendOtpRequest
    {
        // TODO [Task]: Convert to Enum for better validation.
        [Required]
        public OtpMethod Method { get; set; }

        [Required]
        public string To { get; set; }

        [Required]
        public string Otp { get; set; }
    }
}
