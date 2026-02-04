/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Handle notification events when app is in background/terminated
notifee.onBackgroundEvent(async ({ type, detail }) => {
  // No-op: just acknowledge the event so iOS doesn't complain
});

AppRegistry.registerComponent(appName, () => App);
