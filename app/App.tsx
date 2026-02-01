import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {setupNotificationChannel} from './src/features/notifications/notificationService';
import {rescheduleAllNotifications} from './src/features/notifications/notificationScheduler';
import './src/i18n';

export default function App() {
  useEffect(() => {
    async function init() {
      await setupNotificationChannel();
      await rescheduleAllNotifications();
    }
    init().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
