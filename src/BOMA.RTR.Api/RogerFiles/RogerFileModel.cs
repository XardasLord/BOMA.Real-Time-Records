using CsvHelper.Configuration.Attributes;

namespace BOMA.RTR.Api.RogerFiles;

public class RogerFileModel
{
    [Index(1)]
    public RecordEventType? EventType { get; set; }
    
    [Index(2)]
    public string? UserId { get; set; }
    
    [Index(3)]
    public string? Name { get; set; }
    
    [Index(4)]
    public string? LastName { get; set; }
    
    [Index(5)]
    public int? UserRcpId { get; set; }
    
    [Index(6)]
    public DateTime? Date { get; set; }
    
    [Index(7)]
    public TimeSpan? Time { get; set; }
    
    [Index(8)]
    public DepartmentType? DepartmentType { get; set; }

    public bool IsValid() => EventType.HasValue && EventType.Value is not RecordEventType.None && !string.IsNullOrEmpty(UserId);
}

public enum RecordEventType
{
    Entry = 0,
    Exit = 16,
    None = 32
}

public enum DepartmentType
{
    Magazyn = 1,
    Akcesoria = 2,
    Produkcja = 3,
    Pakowanie = 4,
    Empty = 5,
    Boma = 6,
    Zlecenia = 7,
    Agencja = 8,
    OutOfGroup = 9
}