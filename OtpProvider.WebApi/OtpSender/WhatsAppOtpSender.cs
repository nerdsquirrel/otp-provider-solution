namespace OtpProvider.WebApi.OtpSender
{
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text;
    using System.Text.Json;

    public class WhatsAppOtpSender : IOtpSender
    {
        private static readonly HttpClient _httpClient = new()
        {
            Timeout = TimeSpan.FromSeconds(10)
        };
        private readonly string _phoneNumberId; // From Meta developer dashboard
        private readonly string _accessToken;   // Permanent access token

        public WhatsAppOtpSender()
        {
            _phoneNumberId = "792479687285815";
            _accessToken = Environment.GetEnvironmentVariable("otpfy") ?? string.Empty;
        }

        public async Task<bool> SendOtp(string destination, string message)
        {
            var url = $"https://graph.facebook.com/v22.0/{_phoneNumberId}/messages";

            var payload = new
            {
                messaging_product = "whatsapp",
                to = destination,
                type = "text",
                text = new { body = message }
            };

            var json = JsonSerializer.Serialize(payload);
            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            try
            {
                using var response = await _httpClient.SendAsync(request);
                if (response.IsSuccessStatusCode)
                    return true;

                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[WhatsAppOTP] API error: {response.StatusCode} - {errorContent}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[WhatsAppOTP] Unexpected error: {ex.Message}");
                return false;
            }
        }
    }
}
