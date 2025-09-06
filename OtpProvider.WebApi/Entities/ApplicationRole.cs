namespace OtpProvider.WebApi.Entities
{
    public class ApplicationRole
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsDeleted { get; set; } = true;

        public ICollection<ApplicationUserRoles> UserRoles { get; set; } = new List<ApplicationUserRoles>();
    }
}
