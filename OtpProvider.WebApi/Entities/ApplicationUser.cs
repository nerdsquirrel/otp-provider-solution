namespace OtpProvider.WebApi.Entities
{
    public class ApplicationUser
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public ICollection<ApplicationUserRoles> UserRoles { get; set; } = new List<ApplicationUserRoles>();
    }
}
