using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.Entities;
using OtpProvider.WebApi.Security;

namespace OtpProvider.WebApi.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _db;

        public AuthService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var username = loginDto?.Username?.Trim();
            var password = loginDto?.Password;

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrEmpty(password))
            {
                return new LoginResponseDto { IsAuthenticated = false, Roles = new List<string>() };
            }

            var user = await _db.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .SingleOrDefaultAsync(u => u.UserName == username);

            if (user is null || !user.IsActive)
            {
                return new LoginResponseDto { IsAuthenticated = false, Roles = new List<string>() };
            }

            if (!SecurityHashing.VerifyPassword(password, user.PasswordHash))
            {
                return new LoginResponseDto { IsAuthenticated = false, Roles = new List<string>() };
            }

            var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

            return new LoginResponseDto
            {
                IsAuthenticated = true,
                Roles = roles
            };
        }

        public async Task<RegisterResult> RegisterAsync(RegisterDto dto)
        {
            var username = dto?.Username?.Trim();
            var email = dto?.Email?.Trim();
            var password = dto?.Password;

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email) || string.IsNullOrEmpty(password))
            {
                return RegisterResult.Fail("Username, email and password are required.");
            }

            if (username.Length > 25)
            {
                return RegisterResult.Fail("Username must be at most 25 characters.");
            }

            var exists = await _db.Users.AnyAsync(u => u.UserName == username);
            if (exists)
            {
                return RegisterResult.Fail("Username already exists.");
            }

            var user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                PasswordHash = SecurityHashing.HashPassword(password),
                IsActive = true
            };

            _db.Users.Add(user);
            try
            {
                await _db.SaveChangesAsync();
                return RegisterResult.Success();
            }
            catch (DbUpdateException)
            {
                return RegisterResult.Fail("Username already exists.");
            }
        }

        public class LoginResponseDto
        {
            public bool IsAuthenticated { get; init; }
            public List<string> Roles { get; set; } = new List<string>();
        }

        public sealed class RegisterResult
        {
            public bool Succeeded { get; private init; }
            public string? Error { get; private init; }

            public static RegisterResult Success() => new RegisterResult { Succeeded = true };
            public static RegisterResult Fail(string error) => new RegisterResult { Succeeded = false, Error = error };
        }
    }
}
