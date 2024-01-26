import { RecordModel } from '../models/record.model';

const prefix = '[Notifications]';

export class StartWebsocketConnection {
  static readonly type = `${prefix} ${StartWebsocketConnection.name}`;
}

export class CloseWebsocketConnection {
  static readonly type = `${prefix} ${CloseWebsocketConnection.name}`;
}

export class Received {
  static readonly type = `${prefix} ${Received.name}`;

  constructor(public notification: RecordModel[]) {}
}
