import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { patch } from '@ngxs/store/operators';
import {
  EntryExitRecordsGrouped,
  RecordEventType,
  RecordModel,
} from '../models/record.model';
import { Changed, Load } from './roger.action';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable, tap } from 'rxjs';

export interface RogerStateModel {
  records: RecordModel[];
}

const ROGER_STATE_TOKEN = new StateToken<RogerStateModel>('roger');

@State<RogerStateModel>({
  name: ROGER_STATE_TOKEN,
  defaults: {
    records: [],
  },
})
@Injectable()
export class RogerState {
  constructor(private httpClient: HttpClient) {}

  @Selector([ROGER_STATE_TOKEN])
  static getRecords(state: RogerStateModel): RecordModel[] {
    return state.records;
  }

  @Selector([ROGER_STATE_TOKEN])
  static getGroupedRecords(
    state: RogerStateModel
  ): EntryExitRecordsGrouped[][] {
    const groupedRecords = state.records.reduce<{
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

    const result = Object.values(groupedRecords).map(group => {
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

    const entryExitPairRecords = Object.values(groupedRecords).reduce<
      EntryExitRecordsGrouped[][]
    >((acc, group) => {
      // Przekształć grupę w EntryExitRecordsGrouped
      const entry = group.find(
        record => record.eventType === RecordEventType.Entry
      );
      const exit = group.find(
        record => record.eventType === RecordEventType.Exit
      );

      const transformedGroup: EntryExitRecordsGrouped = {
        userRcpId: group[0]?.userRcpId,
        entryDate: entry ? entry.date : '',
        entryTime: entry ? entry.time : '',
        exitDate: exit ? exit.date : '',
        exitTime: exit ? exit.time : '',
      };

      if (acc.length === 0 || acc[acc.length - 1].length === 2) {
        acc.push([transformedGroup]); // Rozpoczyna nową parę
      } else {
        acc[acc.length - 1].push(transformedGroup); // Dodaje do istniejącej pary
      }
      return acc;
    }, []);

    return entryExitPairRecords;
  }

  @Action(Load)
  load(ctx: StateContext<RogerStateModel>, _: Load): Observable<RecordModel[]> {
    return this.httpClient
      .get<RecordModel[]>(`${environment.apiEndpoint}/entryExitTimes`)
      .pipe(
        map(x =>
          x.filter(
            e =>
              (e.eventType === RecordEventType.Entry ||
                e.eventType === RecordEventType.Exit) &&
              e.userRcpId
          )
        ),
        tap(records => {
          ctx.setState(
            patch({
              records: records,
            })
          );
        })
      );
  }

  @Action(Changed)
  changed(ctx: StateContext<RogerStateModel>, action: Changed) {
    ctx.setState(
      patch({
        records: action.records,
      })
    );
  }
}
