using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace OtpProvider.WebApi.OtpSender
{
    /// <summary>
    /// Sends OTP via external SMS HTTP API.
    /// </summary>
    public class SmsOtpSender : IOtpSender
    {
        private const string BaseUrl = "https://api.sms.net.bd/sendsms";
        private readonly string _apiKey;

        private static readonly HttpClient _httpClient = new()
        {
            Timeout = TimeSpan.FromSeconds(10)
        };

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public SmsOtpSender()
        {
            _apiKey = Environment.GetEnvironmentVariable("SMS_API_KEY")
                      ?? "api-key";
        }

        public async Task<bool> SendOtp(string destination, string message)
        {
            if (string.IsNullOrWhiteSpace(destination))
                throw new ArgumentException("Destination phone number required.", nameof(destination));
            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Message required.", nameof(message));

            var query = $"?api_key={UrlEncoder.Default.Encode(_apiKey)}" +
                        $"&msg={UrlEncoder.Default.Encode(message)}" +
                        $"&to={UrlEncoder.Default.Encode(destination)}";

            var requestUri = BaseUrl + query;

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
                request.Headers.Accept.Clear();
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                using var response = await _httpClient.SendAsync(request);
                var contentString = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[SMS] HTTP {(int)response.StatusCode} failure. Body: {contentString}");
                    return false;
                }

                SmsSendResponse? smsResp = null;
                try
                {
                    smsResp = JsonSerializer.Deserialize<SmsSendResponse>(contentString, _jsonOptions);
                }
                catch (Exception deserEx)
                {
                    Console.WriteLine($"[SMS] Deserialize error: {deserEx.Message}. Raw: {contentString}");
                }

                if (smsResp is null)
                {
                    Console.WriteLine("[SMS] Null/invalid response object.");
                    return false;
                }

                if (smsResp.IsSuccess)
                {
                    Console.WriteLine($"[SMS] Success: {smsResp.Msg} (Balance: {smsResp.Data?.Balance ?? "N/A"})");
                    return true;
                }

                Console.WriteLine($"[SMS] Failed (error={smsResp.Error}): {smsResp.Msg}");
                return false;
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine("[SMS] Request timed out.");
                return false;
            }
            catch (Exception ex)
            {
                // Unexpected configuration/network issue -> log and return false
                Console.WriteLine($"[SMS] Unexpected error: {ex.Message}");
                return false;
            }
        }
    }
}