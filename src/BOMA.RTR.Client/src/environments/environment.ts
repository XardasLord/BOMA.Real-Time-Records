import { APP_VERSION } from '../app/version';

export const environment = {
  production: false,

  appVersion: `${APP_VERSION}-dev`,
  apiEndpoint: 'http://localhost:5133',

  signalRHubEndpoint: 'http://localhost:5133/notificationsHub',
};
