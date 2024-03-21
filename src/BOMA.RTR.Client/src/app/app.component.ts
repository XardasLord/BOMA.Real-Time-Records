import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { TableWithRecordsComponent } from './components/table-with-records/table-with-records.component';
import { DepartmentType } from './models/record.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatTabsModule,
    TableWithRecordsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly DepartmentType = DepartmentType;
}
