namespace BOMA.RTR.Api.RogerFiles;

public interface IRogerFileService
{
    IEnumerable<RogerFileModel> ParseRecords();
}