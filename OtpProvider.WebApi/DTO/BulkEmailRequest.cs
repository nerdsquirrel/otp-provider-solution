using System.ComponentModel.DataAnnotations;

namespace WebApi.Practice.DTO
{
    public record BulkEmailRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "At least one recipient is required.")]
        public List<string> ToList { get; init; } = new();

        [Required]
        [StringLength(100)]
        public string Subject { get; init; } = string.Empty;

        [Required]
        public string Body { get; init; } = string.Empty;
    }
}
