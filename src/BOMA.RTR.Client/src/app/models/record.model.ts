export interface RecordModel {
  userRcpId: number;
  date: string;
  time: string;
  eventType: RecordEventType;
  departmentType: DepartmentType;
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

export enum DepartmentType {
  Magazyn = 1,
  Akcesoria = 2,
  Produkcja = 3,
  Pakowanie = 4,
  Empty = 5,
  Boma = 6,
  Zlecenia = 7,
  Agencja = 8,
  OutOfGroup = 9,
}
