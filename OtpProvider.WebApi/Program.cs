using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OtpProvider.WebApi.Config;
using OtpProvider.WebApi.Data;
using OtpProvider.WebApi.DTO;
using OtpProvider.WebApi.OtpSender;
using OtpProvider.WebApi.Services;
using System.Text;
using System.Text.Json.Serialization;
using WebApi.Practice.Factory;
using WebApi.Practice.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure Gmail settings
builder.Services.Configure<GmailSetting>(
    builder.Configuration.GetSection("GmailSetting"));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register OTP senders
builder.Services.AddScoped<SmsOtpSender>();
builder.Services.AddScoped<AuthService>();

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
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? string.Empty))
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendDev", policy =>
    {
        policy.WithOrigins("http://localhost:53017")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // keep if you plan to use cookies; fine for Authorization header too
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => {
        options.SwaggerEndpoint("/openapi/v1.json", "OtpProvider.WebApi");
    });
}

// app.UseHttpsRedirection();
app.UseCors("FrontendDev");
app.UseAuthentication();

app.UseDefaultFiles();
app.UseStaticFiles();

var defaultFileOptions = new DefaultFilesOptions();
defaultFileOptions.DefaultFileNames.Clear();
defaultFileOptions.DefaultFileNames.Add("index.html"); // your desired startup file (must be in wwwroot)
app.UseDefaultFiles(defaultFileOptions);

app.UseAuthorization();
app.MapControllers();

app.Run();
