import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordModel } from './models/record.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  entryExitRecords$!: Observable<RecordModel[]>;

  constructor(private httpClient: HttpClient) {}

  ngOnInit(): void {
    this.entryExitRecords$ = this.getEntryExitRecords();
  }

  private getEntryExitRecords(): Observable<RecordModel[]> {
    return this.httpClient.get<RecordModel[]>(
      `http://localhost:5133/entryExitTimes`
    );
  }
}
