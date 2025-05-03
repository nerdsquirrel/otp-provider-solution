using System.ComponentModel.DataAnnotations;

namespace WebApi.Practice.Model
{
    public class SendOtpRequest
    {
        // TODO [Task]: Convert to Enum for better validation.
        [Required]
        public string Method { get; set; }

        [Required]
        public string To { get; set; }

        [Required]
        public string Otp { get; set; }
    }
}
