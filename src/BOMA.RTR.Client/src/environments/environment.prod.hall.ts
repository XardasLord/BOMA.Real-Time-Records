import { APP_VERSION } from '../app/version';

export const environment = {
  production: true,

  appVersion: `${APP_VERSION}`,
  apiEndpoint: 'http://192.168.0.161:91',

  signalRHubEndpoint: 'http://192.168.0.161:91/notificationsHub',
};
