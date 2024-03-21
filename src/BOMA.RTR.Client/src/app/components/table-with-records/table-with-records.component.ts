import { Component, Input, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  DepartmentType,
  EntryExitRecordsGrouped,
} from '../../models/record.model';
import { StartWebsocketConnection } from '../../state/notifications.action';
import { Load } from '../../state/roger.action';
import { RogerState } from '../../state/roger.state';

@Component({
  selector: 'app-table-with-records',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './table-with-records.component.html',
  styleUrl: './table-with-records.component.css',
})
export class TableWithRecordsComponent implements OnInit {
  @Input() department!: DepartmentType;

  entryExitPairRecords$!: Observable<EntryExitRecordsGrouped[][]>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch([new StartWebsocketConnection(), new Load()]);

    switch (this.department) {
      case DepartmentType.Magazyn:
        this.entryExitPairRecords$ = this.store.select(
          RogerState.getGroupedRecordsForHall
        );
        break;
      case DepartmentType.Produkcja:
        this.entryExitPairRecords$ = this.store.select(
          RogerState.getGroupedRecordsForProduction
        );
        break;
    }
  }
}
