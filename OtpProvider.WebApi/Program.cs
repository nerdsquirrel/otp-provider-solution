using OtpProvider.WebApi.OtpSender;
using WebApi.Practice.Factory;
using WebApi.Practice.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    options.SuppressModelStateInvalidFilter = false;
});
builder.Services.AddScoped<SmsOtpSender>();
builder.Services.AddScoped<GmailEmailService>();
builder.Services.AddScoped<SendGridEmailService>();
builder.Services.AddScoped<EmailServiceFactory>();
builder.Services.AddScoped<OtpSenderFactory>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
