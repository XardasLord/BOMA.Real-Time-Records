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

    // Sorting by entry datetime desc firstly
    resultRecords.sort((a, b) => {
      const datePartA = a.entryDate.split('T')[0];
      const datePartB = b.entryDate.split('T')[0];

      const dateTimeA = new Date(`${datePartA}T${a.entryTime}`);
      const dateTimeB = new Date(`${datePartB}T${b.entryTime}`);

      return dateTimeB.getTime() - dateTimeA.getTime();
    });

    // Sorting by exit datetime desc lastly
    resultRecords.sort((a, b) => {
      const datePartA = a.exitDate.split('T')[0];
      const datePartB = b.exitDate.split('T')[0];

      const dateTimeA = new Date(`${datePartA}T${a.exitTime}`);
      const dateTimeB = new Date(`${datePartB}T${b.exitTime}`);

      return dateTimeB.getTime() - dateTimeA.getTime();
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
    return records.filter(
      x => ![6, 0].includes(new Date(x.date).getDay()) // Dodanie warunku odfiltrowania sobót i niedziel
    );
  }
}
