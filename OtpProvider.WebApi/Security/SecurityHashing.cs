using System.Security.Cryptography;
using System.Text;

namespace OtpProvider.WebApi.Security
{
    /// <summary>
    /// Centralized hashing utilities for passwords and short-lived OTP codes.
    /// Passwords: PBKDF2 (salted, iterated).
    /// OTP codes: Straight SHA-256 (no salt) because:
    ///   - They are short-lived (minutes)
    ///   - Low entropy (4 digits) means salting does not materially improve security against offline attack
    ///   - We only need integrity + concealment at rest
    /// If you increase OTP length/entropy later you may switch to a salted scheme.
    /// </summary>
    public static class SecurityHashing
    {
        // PBKDF2 parameters (keep in sync if changed)
        private const int Pbkdf2Iterations = 100_000;
        private const int SaltSize = 16;   // 128-bit
        private const int KeySize = 32;    // 256-bit

        private const string PasswordPrefix = "PBKDF2";
        private const string OtpPrefix = "OTP_SHA256"; // Scheme identifier for potential future change

        public static string HashPassword(string password)
        {
            Span<byte> salt = stackalloc byte[SaltSize];
            RandomNumberGenerator.Fill(salt);

            var hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt.ToArray(),
                Pbkdf2Iterations,
                HashAlgorithmName.SHA256,
                KeySize);

            return $"{PasswordPrefix}|{Pbkdf2Iterations}|{Convert.ToBase64String(salt)}|{Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string password, string stored)
        {
            if (string.IsNullOrWhiteSpace(stored)) return false;

            var parts = stored.Split('|', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 4 || !parts[0].Equals(PasswordPrefix, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!int.TryParse(parts[1], out var iterations) || iterations <= 0)
                return false;

            byte[] salt, expected;
            try
            {
                salt = Convert.FromBase64String(parts[2]);
                expected = Convert.FromBase64String(parts[3]);
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
                expected.Length);

            return CryptographicOperations.FixedTimeEquals(computed, expected);
        }

        public static string HashOtp(string otp)
        {
            // SHA-256 Hex
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(otp));
            return $"{OtpPrefix}|{Convert.ToHexString(bytes)}";
        }

        public static bool VerifyOtp(string providedOtp, string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash)) return false;
            var parts = storedHash.Split('|', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 2 || !parts[0].Equals(OtpPrefix, StringComparison.OrdinalIgnoreCase))
                return false;

            var recomputed = HashOtp(providedOtp);
            return FixedTimeEquals(storedHash, recomputed);
        }

        public static bool FixedTimeEquals(string a, string b)
        {
            if (a.Length != b.Length) return false;
            var diff = 0;
            for (int i = 0; i < a.Length; i++)
                diff |= a[i] ^ b[i];
            return diff == 0;
        }
    }
}