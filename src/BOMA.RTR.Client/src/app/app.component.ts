import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { filter, groupBy, map, mergeMap, Observable, toArray } from 'rxjs';
import { RecordEventType, RecordModel } from './models/record.model';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  entryExitRecords$!: Observable<EntryExitRecordsGrouped[]>;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.entryExitRecords$ = this.getEntryExitRecordsGrouped();
  }

  private getEntryExitRecordsGrouped(): Observable<EntryExitRecordsGrouped[]> {
    return this.getEntryExitRecords().pipe(
      mergeMap(records => records),
      groupBy(record => ({
        id: record.userRcpId,
        day: new Date(record.date).toDateString(),
      })),
      mergeMap(group => group.pipe(toArray())),
      map(groupedRecords => {
        const entry = groupedRecords.find(
          record => record.eventType === RecordEventType.Entry
        );
        const exit = groupedRecords.find(
          record => record.eventType === RecordEventType.Exit
        );

        return {
          userRcpId: groupedRecords[0].userRcpId,
          entryDate: entry ? entry.date : '',
          entryTime: entry ? entry.time : '',
          exitDate: exit ? exit.date : '',
          exitTime: exit ? exit.time : '',
        };
      }),
      toArray()
    );
  }

  private getEntryExitRecords(): Observable<RecordModel[]> {
    return this.httpClient
      .get<RecordModel[]>(`${environment.apiEndpoint}/entryExitTimes`)
      .pipe(
        map(x =>
          x.filter(
            e =>
              e.eventType === RecordEventType.Entry ||
              e.eventType === RecordEventType.Exit
          )
        )
      );
  }
}

export interface EntryExitRecordsGrouped {
  userRcpId: number;
  entryDate: string;
  entryTime: string;
  exitDate: string;
  exitTime: string;
}
