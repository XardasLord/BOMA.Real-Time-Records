import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { routes } from './app.routes';
import { NotificationsState } from './state/notifications.state';
import { environment } from '../environments/environment';
import { WebsocketNotificationsService } from './signalr/websocket-notifications.service';
import { RogerState } from './state/roger.state';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      NgxsModule.forRoot([RogerState, NotificationsState], {
        developmentMode: !environment.production,
        selectorOptions: {
          suppressErrors: false,
          injectContainerState: false,
        },
      }),
      NgxsLoggerPluginModule.forRoot({
        collapsed: false,
        disabled: environment.production,
      }),
      NgxsReduxDevtoolsPluginModule.forRoot()
    ),
    provideHttpClient(),
    WebsocketNotificationsService,
  ],
};
