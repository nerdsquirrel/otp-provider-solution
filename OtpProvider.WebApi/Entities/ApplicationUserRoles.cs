namespace OtpProvider.WebApi.Entities
{
    public class ApplicationUserRoles
    {
        public int UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;
        public int RoleId { get; set; }
        public ApplicationRole Role { get; set; } = null!;
    }
}
