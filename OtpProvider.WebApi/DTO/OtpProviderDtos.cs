using System.ComponentModel.DataAnnotations;
using OtpProvider.WebApi.Entities;

namespace OtpProvider.WebApi.DTO
{
    public class OtpProviderDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public OtpMethod DeliveryType { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ConfigurationJson { get; set; } = string.Empty;
    }

    public class OtpProviderCreateDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(512)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public OtpMethod DeliveryType { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(2048)]
        public string ConfigurationJson { get; set; } = string.Empty;
    }

    public class OtpProviderUpdateDto
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(512)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public OtpMethod DeliveryType { get; set; }

        public bool IsActive { get; set; }

        [MaxLength(2048)]
        public string ConfigurationJson { get; set; } = string.Empty;
    }

    internal static class OtpProviderMappingExtensions
    {
        public static OtpProviderDto ToDto(this Entities.OtpProvider entity) => new()
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            DeliveryType = entity.DeliveryType,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            ConfigurationJson = entity.ConfigurationJson
        };

        public static void ApplyUpdate(this Entities.OtpProvider entity, OtpProviderUpdateDto dto)
        {
            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.DeliveryType = dto.DeliveryType;
            entity.IsActive = dto.IsActive;
            entity.ConfigurationJson = dto.ConfigurationJson;
        }
    }
}