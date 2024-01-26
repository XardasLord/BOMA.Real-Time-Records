import { Observable, take } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { LogLevel } from '@microsoft/signalr';

export abstract class WebsocketServiceBase {
  protected hubConnection: signalR.HubConnection | undefined;
  private reconnectDelay = 5000;

  public abstract startConnection(): Observable<any>;

  public closeConnection() {
    if (!this.hubConnection) {
      return;
    }

    this.hubConnection
      .stop()
      .then(() => {
        this.hubConnection = undefined;
      })
      .catch(error => {
        setTimeout(() => this.closeConnection(), this.reconnectDelay);
      });
  }

  protected buildConnection(urlToHub: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(urlToHub, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Trace)
      .build();

    this.hubConnection.onclose(() => this.restoreConnection());
  }

  protected restoreConnection() {
    setTimeout(
      () => this.startConnection().pipe(take(1)).subscribe(),
      this.reconnectDelay
    );
  }
}
