import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { WebsocketServiceBase } from './websocket.service.base';
import { environment } from '../../environments/environment';
import { RecordModel } from '../models/record.model';
import { Changed } from '../state/roger.action';

@Injectable()
export class WebsocketNotificationsService extends WebsocketServiceBase {
  private hubAddress = environment.signalRHubEndpoint;
  private notificationReceivedMethodName = 'NotificationReceived';

  constructor(private store: Store) {
    super();
  }

  public startConnection(): any {
    this.buildConnection(this.hubAddress);

    return this.hubConnection!.start()
      .then(() => {
        if (!this.hubConnection) {
          console.error('Hub connection is null');
          return;
        }

        this.registerNotificationReceivedWebSocket();
      })
      .catch(_ => {
        this.restoreConnection();
      });
  }

  protected registerNotificationReceivedWebSocket(): void {
    this.hubConnection?.on(
      this.notificationReceivedMethodName,
      (notification: RecordModel[]) => {
        console.log(
          `Notification received from SignalR: ${JSON.stringify(notification)}`
        );

        this.store.dispatch(new Changed(notification));
      }
    );
  }
}
