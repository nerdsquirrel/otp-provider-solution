using System.ComponentModel.DataAnnotations;

namespace OtpProvider.WebApi.Entities
{
    public class OtpProvider
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public OtpMethod DeliveryType { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(2048)]
        public string ConfigurationJson { get; set; } = string.Empty;
        public ICollection<OtpRequest> OtpRequests { get; set; } = new List<OtpRequest>();
    }
}
