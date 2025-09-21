namespace OtpProvider.WebApi.OtpSender
{
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text;
    using System.Text.Json;

    public class WhatsAppOtpSender : IOtpSender
    {
        private readonly HttpClient _httpClient;
        private readonly string _phoneNumberId; // From Meta developer dashboard
        private readonly string _accessToken;   // Permanent access token

        public WhatsAppOtpSender(HttpClient httpClient, string phoneNumberId, string accessToken)
        {
            _httpClient = httpClient;
            _phoneNumberId = phoneNumberId;
            _accessToken = accessToken;
        }

        public void SendOtp(string destination, string message)
        {
            var url = $"https://graph.facebook.com/v20.0/{_phoneNumberId}/messages";

            var payload = new
            {
                messaging_product = "whatsapp",
                to = destination,   // recipient phone number in international format, e.g. "88017xxxxxxx"
                type = "text",
                text = new { body = message }
            };

            var json = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);

            var response = _httpClient.Send(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = response.Content.ReadAsStringAsync().Result;
                throw new Exception($"WhatsApp API error: {response.StatusCode} - {errorContent}");
            }
        }
    }

}
