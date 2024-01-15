export interface RecordModel {
  userRcpId: number;
  date: Date;
  time: string;
  eventType: RecordEventType;
}

export enum RecordEventType {
  Entry = 0,
  Exit = 16,
}
