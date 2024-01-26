export interface RecordModel {
  userRcpId: number;
  date: string;
  time: string;
  eventType: RecordEventType;
}

export enum RecordEventType {
  Entry = 0,
  Exit = 16,
}

export interface EntryExitRecordsGrouped {
  userRcpId: number;
  entryDate: string;
  entryTime: string;
  exitDate: string;
  exitTime: string;
}
