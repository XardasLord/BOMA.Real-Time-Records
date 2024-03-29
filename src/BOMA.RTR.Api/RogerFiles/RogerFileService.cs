﻿using System.Globalization;
using BOMA.RTR.Api.SignalR;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Extensions.Options;

namespace BOMA.RTR.Api.RogerFiles;

public class RogerFileService : IRogerFileService
{
    private readonly INotificationsService _notificationsService;
    private readonly RogerFileConfiguration _options;
    private readonly FileSystemWatcher _fileSystemWatcher;

    public RogerFileService(IOptions<RogerFileConfiguration> options, INotificationsService notificationsService)
    {
        _notificationsService = notificationsService;
        _options = options.Value;
        
        _fileSystemWatcher = new FileSystemWatcher(_options.FileLocation);
        _fileSystemWatcher.Filter = _options.FileName;
        _fileSystemWatcher.NotifyFilter = 
            NotifyFilters.DirectoryName | 
            NotifyFilters.FileName | 
            NotifyFilters.LastWrite | 
            NotifyFilters.CreationTime | 
            NotifyFilters.Size;
        _fileSystemWatcher.IncludeSubdirectories = false;
    }

    public IEnumerable<RogerFileModel> ParseRecords()
    {
        var files = Directory.GetFiles(_options.FileLocation, _options.FileName);
        var records = new List<RogerFileModel>();
        
        if (files.Length < 1)
            return records;
        
        foreach (var csvFile in files)
            records.AddRange(ParseCsv(csvFile));

        records = records.OrderByDescending(x => x.Date).ToList();

        return records;
    }

    public void RegisterFileWatcher()
    {
        Console.WriteLine("RegisterFileWatcher");
        
        _fileSystemWatcher.Created += RogerFileUpdated;
        _fileSystemWatcher.Changed += RogerFileUpdated;
        _fileSystemWatcher.Deleted += RogerFileUpdated;
        
        _fileSystemWatcher.EnableRaisingEvents = true;
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
        
        return csv.GetRecords<RogerFileModel>().Where(x => x.IsValid()).ToList();
    }

    private void RogerFileUpdated(object sender, FileSystemEventArgs e)
    {
        var records = ParseRecords();

        _notificationsService.SendNewRogerFileNotification(records);
    }
}