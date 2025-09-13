using OtpProvider.WebApi.Entities;
using System.ComponentModel.DataAnnotations;

namespace WebApi.Practice.Model
{
    public class SendOtpRequest
    {
        [Required]
        public OtpMethod Method { get; set; }

        [Required]
        public required string To { get; set; }

        public string Purpose { get; set; } = string.Empty;
    }
}
