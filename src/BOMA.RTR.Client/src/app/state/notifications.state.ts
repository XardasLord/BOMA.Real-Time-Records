import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { patch } from '@ngxs/store/operators';
import {
  CloseWebsocketConnection,
  Received,
  StartWebsocketConnection,
} from './notifications.action';
import { WebsocketNotificationsService } from '../signalr/websocket-notifications.service';
import { RecordModel } from '../models/record.model';
import { Changed } from './roger.action';

export interface NotificationsStateModel {
  lastNotification: RecordModel[];
}

const NOTIFICATIONS_STATE_TOKEN = new StateToken<NotificationsStateModel>(
  'notifications'
);

@State<NotificationsStateModel>({
  name: NOTIFICATIONS_STATE_TOKEN,
  defaults: {
    lastNotification: [],
  },
})
@Injectable()
export class NotificationsState {
  constructor(private notificationsService: WebsocketNotificationsService) {}

  @Selector([NOTIFICATIONS_STATE_TOKEN])
  static getLastNotification(state: NotificationsStateModel): RecordModel[] {
    return state.lastNotification;
  }

  @Action(StartWebsocketConnection)
  startConnection(
    ctx: StateContext<NotificationsStateModel>,
    _: StartWebsocketConnection
  ) {
    return this.notificationsService.startConnection();
  }

  @Action(CloseWebsocketConnection)
  closeConnection(
    ctx: StateContext<NotificationsStateModel>,
    _: CloseWebsocketConnection
  ) {
    return this.notificationsService.closeConnection();
  }

  @Action(Received)
  received(ctx: StateContext<NotificationsStateModel>, action: Received) {
    ctx.setState(
      patch({
        lastNotification: action.notification,
      })
    );

    return ctx.dispatch(new Changed(action.notification));
  }
}
