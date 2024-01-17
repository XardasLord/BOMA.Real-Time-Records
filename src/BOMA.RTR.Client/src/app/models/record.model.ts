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
