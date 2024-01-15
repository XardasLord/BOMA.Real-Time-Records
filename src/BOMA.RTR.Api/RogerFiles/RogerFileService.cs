using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Extensions.Options;

namespace BOMA.RTR.Api.RogerFiles;

public class RogerFileService : IRogerFileService
{
    private readonly RogerFileConfiguration _options;

    public RogerFileService(IOptions<RogerFileConfiguration> options)
    {
        _options = options.Value;
    }

    public IEnumerable<RogerFileModel> ParseRecords()
    {
        var files = Directory.GetFiles(_options.FileLocation, "*.csv");
        var records = new List<RogerFileModel>();
        
        if (files.Length < 1)
        {
            return records;
        }
        

        foreach (var csvFile in files)
        {
            var results = ParseCsv(csvFile);

            records.AddRange(results);
        }

        return records;
    }
    
    private static List<RogerFileModel> ParseCsv(string fileLocation)
    {
        using var reader = new StreamReader(fileLocation);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ";",
            HasHeaderRecord = true,
            MissingFieldFound = null,
            TrimOptions = TrimOptions.Trim
        });
        
        return csv.GetRecords<RogerFileModel>().ToList();
    }
}