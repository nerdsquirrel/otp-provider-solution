using System.Text.Json.Serialization;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.OtpSender;
using WebApi.Practice.Factory;
using WebApi.Practice.Model;
using WebApi.Practice.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Gmail settings
builder.Services.Configure<GmailSetting>(
    builder.Configuration.GetSection("GmailSetting"));

// Register OTP senders
builder.Services.AddScoped<SmsOtpSender>();

// Register email services as concrete types for the factory
builder.Services.AddScoped<GmailEmailService>();
builder.Services.AddScoped<SendGridEmailService>();

// Register factories
builder.Services.AddScoped<EmailServiceFactory>();
builder.Services.AddScoped<OtpSenderFactory>();

// Add controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Allow enum values as strings
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        // Case-insensitive property names
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = false;
    });

// Configure OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => {
        options.SwaggerEndpoint("/openapi/v1.json", "OtpProvider.WebApi");
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
