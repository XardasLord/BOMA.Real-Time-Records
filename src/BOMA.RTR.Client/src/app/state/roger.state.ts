import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { map, Observable, tap } from 'rxjs';
import {
  DepartmentType,
  EntryExitRecordsGrouped,
  RecordEventType,
  RecordModel,
} from '../models/record.model';
import { Changed, Load } from './roger.action';
import { environment } from '../../environments/environment';

export interface RogerStateModel {
  recordsAll: RecordModel[];
  recordsForProduction: RecordModel[];
  recordsForManager: RecordModel[];
}

const ROGER_STATE_TOKEN = new StateToken<RogerStateModel>('roger');

@State<RogerStateModel>({
  name: ROGER_STATE_TOKEN,
  defaults: {
    recordsAll: [],
    recordsForProduction: [],
    recordsForManager: [],
  },
})
@Injectable()
export class RogerState {
  productionHallRelatedDepartments = [
    DepartmentType.Produkcja,
    DepartmentType.Pakowanie,
    DepartmentType.Zlecenia,
    DepartmentType.Boma,
  ];

  warehouseRelatedDepartments = [
    DepartmentType.Magazyn,
    DepartmentType.Akcesoria,
  ];

  constructor(private httpClient: HttpClient) {}

  @Selector([ROGER_STATE_TOKEN])
  static getAllRecords(state: RogerStateModel): RecordModel[] {
    return state.recordsAll;
  }

  @Selector([ROGER_STATE_TOKEN])
  static getGroupedRecordsForProduction(
    state: RogerStateModel
  ): EntryExitRecordsGrouped[][] {
    return this.groupRecords(state.recordsForProduction);
  }

  @Selector([ROGER_STATE_TOKEN])
  static getGroupedRecordsForManager(
    state: RogerStateModel
  ): EntryExitRecordsGrouped[][] {
    return this.groupRecords(state.recordsForManager);
  }

  private static groupRecords(records: RecordModel[]) {
    const groupedRecords = records.reduce<{
      [key: string]: RecordModel[];
    }>((acc, record) => {
      const day = new Date(record.date).toDateString();
      const key = `${record.userRcpId}-${day}`;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(record);

      return acc;
    }, {});

    const resultRecords = Object.values(groupedRecords).map(group => {
      const entry = group.find(
        record => record.eventType === RecordEventType.Entry
      );
      const exit = group.find(
        record => record.eventType === RecordEventType.Exit
      );

      return {
        userRcpId: group[0].userRcpId,
        entryDate: entry ? entry.date : '',
        entryTime: entry ? entry.time : '',
        exitDate: exit ? exit.date : '',
        exitTime: exit ? exit.time : '',
      };
    });

    // Sorting from the newest to the oldest records
    resultRecords.sort((a, b) => {
      const aMaxDate = a.exitDate.split('T')[0] || a.entryDate.split('T')[0];
      const bMaxDate = b.exitDate.split('T')[0] || b.entryDate.split('T')[0];
      const aMaxTime = a.exitTime.split('T')[0] || a.entryTime.split('T')[0];
      const bMaxTime = b.exitTime.split('T')[0] || b.entryTime.split('T')[0];

      const aDateTime = new Date(`${aMaxDate} ${aMaxTime}`);
      const bDateTime = new Date(`${bMaxDate} ${bMaxTime}`);

      return bDateTime.getTime() - aDateTime.getTime();
    });

    // Converting to [][] array
    const transformedRecords: EntryExitRecordsGrouped[][] = [[], []];

    resultRecords.forEach((record, index) => {
      if (index % 2 === 0) {
        transformedRecords[0].push(record);
      } else {
        transformedRecords[1].push(record);
      }
    });

    return transformedRecords;
  }

  @Action(Load)
  load(ctx: StateContext<RogerStateModel>, _: Load): Observable<RecordModel[]> {
    return this.httpClient
      .get<RecordModel[]>(`${environment.apiEndpoint}/entryExitTimes`)
      .pipe(
        map(x => this.filterRecords(x)),
        tap(records => {
          ctx.setState(
            patch({
              recordsAll: records,
              recordsForProduction: records.filter(x =>
                this.productionHallRelatedDepartments.includes(x.departmentType)
              ),
              recordsForManager: records.filter(x =>
                this.warehouseRelatedDepartments.includes(x.departmentType)
              ),
            })
          );
        })
      );
  }

  @Action(Changed)
  changed(ctx: StateContext<RogerStateModel>, action: Changed) {
    const records = this.filterRecords(action.records);

    ctx.setState(
      patch({
        recordsAll: records,
        recordsForProduction: records.filter(x =>
          this.productionHallRelatedDepartments.includes(x.departmentType)
        ),
        recordsForManager: records.filter(x =>
          this.warehouseRelatedDepartments.includes(x.departmentType)
        ),
      })
    );
  }

  private filterRecords(records: RecordModel[]) {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return records.filter(record => {
      const recordDate = new Date(record.date);

      return (
        // Filtruj zapisy z ostatnich 3 dni oraz pomijając soboty i niedziele
        recordDate >= threeDaysAgo && ![6, 0].includes(recordDate.getDay())
      );
    });
  }
}
