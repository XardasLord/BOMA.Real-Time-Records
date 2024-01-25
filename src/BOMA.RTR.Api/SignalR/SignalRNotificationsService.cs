using BOMA.RTR.Api.RogerFiles;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;

namespace BOMA.RTR.Api.SignalR;

public class SignalRNotificationsService(IHubContext<SignalRNotificationsHub> hubContext, IOptions<SignalROptions> signalRConfiguration) : INotificationsService
{
	private readonly SignalROptions _signalRConfiguration = signalRConfiguration.Value;

	public Task SendNewRogerFileNotification(IEnumerable<RogerFileModel> entryExitTimes)
	{
		return hubContext
			.Clients
			.All
			.SendAsync(_signalRConfiguration.NotificationMethodName, entryExitTimes);
	}
}