using BOMA.RTR.Api.RogerFiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();
builder.Services.AddCors();

builder.Services.Configure<RogerFileConfiguration>(builder.Configuration.GetSection(RogerFileConfiguration.Location));
builder.Services.AddTransient<IRogerFileService, RogerFileService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(x => x
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseHttpsRedirection();

app.UseHealthChecks("/healthz");

app.MapGet("/entryExitTimes", (IRogerFileService rogerFileService) =>
    {
        var records = rogerFileService.ParseRecords();
        
        return records;
    })
.WithName("GetEntryExitTimes")
.WithOpenApi();

app.Run();