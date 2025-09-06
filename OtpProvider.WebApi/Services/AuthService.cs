using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.Entities;

namespace OtpProvider.WebApi.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _db;

        // PBKDF2 parameters used consistently for both hashing and verification
        private const int Pbkdf2Iterations = 100_000;
        private const int SaltSize = 16;   // 128-bit salt
        private const int KeySize = 32;    // 256-bit derived key

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

            if (!VerifyPassword(password, user.PasswordHash))
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

            // App-level uniqueness check (DB unique index is the final guard)
            var exists = await _db.Users.AnyAsync(u => u.UserName == username);
            if (exists)
            {
                return RegisterResult.Fail("Username already exists.");
            }

            var user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                PasswordHash = HashPassword(password),
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
                // In case of race condition hitting the unique index
                return RegisterResult.Fail("Username already exists.");
            }
        }

        // Password hashing and verification (PBKDF2 with SHA-256)
        private static string HashPassword(string password)
        {
            Span<byte> salt = stackalloc byte[SaltSize];
            RandomNumberGenerator.Fill(salt);

            var hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt.ToArray(),
                Pbkdf2Iterations,
                HashAlgorithmName.SHA256,
                KeySize);

            return $"PBKDF2|{Pbkdf2Iterations}|{Convert.ToBase64String(salt)}|{Convert.ToBase64String(hash)}";
        }

        // Expects PasswordHash format: "PBKDF2|<iterations>|<saltBase64>|<hashBase64>"
        private static bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash)) return false;

            var parts = storedHash.Split('|', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 4 || !string.Equals(parts[0], "PBKDF2", StringComparison.OrdinalIgnoreCase))
                return false;

            if (!int.TryParse(parts[1], out var iterations) || iterations <= 0)
                return false;

            byte[] salt, expectedHash;
            try
            {
                salt = Convert.FromBase64String(parts[2]);
                expectedHash = Convert.FromBase64String(parts[3]);
            }
            catch
            {
                return false;
            }

            var computed = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                iterations,
                HashAlgorithmName.SHA256,
                expectedHash.Length);

            return CryptographicOperations.FixedTimeEquals(computed, expectedHash);
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
