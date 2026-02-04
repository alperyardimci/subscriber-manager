import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';

const CHANNEL_ID = 'payment-reminders';

export async function setupNotificationChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Payment Reminders',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestPermissions(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

export async function scheduleLocalNotification(
  id: string,
  date: Date,
  title: string,
  body: string,
): Promise<void> {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
      },
    },
    trigger,
  );
}

export async function displayImmediateNotification(
  id: string,
  title: string,
  body: string,
): Promise<void> {
  await notifee.displayNotification({
    id,
    title,
    body,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {id: 'default'},
    },
  });
}

export async function cancelLocalNotification(id: string): Promise<void> {
  await notifee.cancelNotification(id);
}

export async function cancelAllLocalNotifications(): Promise<void> {
  await notifee.cancelAllNotifications();
}
