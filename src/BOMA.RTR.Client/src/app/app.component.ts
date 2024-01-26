import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { EntryExitRecordsGrouped } from './models/record.model';
import { Load } from './state/roger.action';
import { StartWebsocketConnection } from './state/notifications.action';
import { RogerState } from './state/roger.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  entryExitPairRecords$!: Observable<EntryExitRecordsGrouped[][]>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch([new StartWebsocketConnection(), new Load()]);

    this.entryExitPairRecords$ = this.store.select(
      RogerState.getGroupedRecords
    );
  }
}
