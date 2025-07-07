using OtpProvider.WebApi.DTO;

namespace OtpProvider.WebApi.Services
{
    public class AuthService
    {
        private readonly HttpClient _httpClient;

        public AuthService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var response = await _httpClient.PostAsJsonAsync("/Login", loginDto);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<LoginResponseDto>();
            }
            return new LoginResponseDto
            {
                IsAuthenticated = false,
                Roles = new List<string>()
            };
        }

        public class LoginResponseDto
        {
            public bool IsAuthenticated { get; init; }
            public List<string> Roles { get; set; } = new List<string>();
        }
    }
}
