import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BackgroundFetch from 'react-native-background-fetch';
import {AppNavigator} from './src/navigation/AppNavigator';
import {setupNotificationChannel} from './src/features/notifications/notificationService';
import {rescheduleAllNotifications} from './src/features/notifications/notificationScheduler';
import './src/i18n';

export default function App() {
  useEffect(() => {
    async function init() {
      await setupNotificationChannel();
      await rescheduleAllNotifications();
      initBackgroundFetch();
    }
    init().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

async function initBackgroundFetch() {
  await BackgroundFetch.configure(
    {minimumFetchInterval: 60}, // iOS will decide actual frequency
    async taskId => {
      // Background fetch event: reschedule all notifications
      await rescheduleAllNotifications();
      BackgroundFetch.finish(taskId);
    },
    async taskId => {
      // Timeout: must finish immediately
      BackgroundFetch.finish(taskId);
    },
  );
}
