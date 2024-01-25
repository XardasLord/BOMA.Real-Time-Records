using BOMA.RTR.Api.RogerFiles;

namespace BOMA.RTR.Api.SignalR;

public interface INotificationsService
{
    Task SendNewRogerFileNotification(IEnumerable<RogerFileModel> entryExitTimes);
}