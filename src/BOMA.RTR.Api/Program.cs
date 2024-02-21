using BOMA.RTR.Api.RogerFiles;
using BOMA.RTR.Api.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();
builder.Services.AddCors();

// Roger
builder.Services.Configure<RogerFileConfiguration>(builder.Configuration.GetSection(RogerFileConfiguration.Location));
builder.Services.AddSingleton<IRogerFileService, RogerFileService>();

// SignalR
builder.Services.AddSignalR();
builder.Services.Configure<SignalROptions>(builder.Configuration.GetRequiredSection(SignalRConfigurationFileConst.SignalRConfigSection));
builder.Services.AddTransient<INotificationsService, SignalRNotificationsService>();

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

var notificationHubEndpoint = builder.Configuration.GetRequiredSection(SignalRConfigurationFileConst.SignalRConfigSection)
    [SignalRConfigurationFileConst.HubEndpointConfigKey];

app.MapHub<SignalRNotificationsHub>(notificationHubEndpoint!);

var rogerFileService = app.Services.GetRequiredService<IRogerFileService>();
rogerFileService.RegisterFileWatcher();

app.Run();