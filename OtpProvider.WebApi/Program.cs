using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using OtpProvider.WebApi.Config;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.OtpSender;
using OtpProvider.WebApi.Services;
using WebApi.Practice.Factory;
using WebApi.Practice.Model;
using WebApi.Practice.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Gmail settings
builder.Services.Configure<GmailSetting>(
    builder.Configuration.GetSection("GmailSetting"));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

// Register OTP senders
builder.Services.AddScoped<SmsOtpSender>();

// Register email services as concrete types for the factory
builder.Services.AddScoped<GmailEmailService>();
builder.Services.AddScoped<SendGridEmailService>();

// Register factories
builder.Services.AddScoped<EmailServiceFactory>();
builder.Services.AddScoped<OtpSenderFactory>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
        };
    });

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

builder.Services.AddHttpClient<AuthService>(client => {
    client.BaseAddress = new Uri(builder.Configuration["AuthService:BaseUrl"]);
});

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
