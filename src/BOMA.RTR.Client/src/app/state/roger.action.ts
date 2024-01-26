import { RecordModel } from '../models/record.model';

const prefix = '[Roger]';

export class Load {
  static readonly type = `${prefix} ${Load.name}`;
}

export class Changed {
  static readonly type = `${prefix} ${Changed.name}`;

  constructor(public records: RecordModel[]) {}
}
