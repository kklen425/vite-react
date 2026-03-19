import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleWorkoutReminder(time: string): Promise<void> {
  // Cancel existing reminders first
  await cancelWorkoutReminder();

  const [hourStr, minStr] = time.split(':');
  const hour   = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💪 係時候去gym喇！',
      body: '今日唔練，聽日後悔。',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      // Android channel
      ...(Platform.OS === 'android' ? { channelId: 'workout-reminder' } : {}),
    } as Notifications.NotificationTriggerInput,
  });
}

export async function cancelWorkoutReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleRestTimerAlert(seconds: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏱ 休息完畢！',
      body: '可以做下一組喇。',
      sound: true,
    },
    trigger: { seconds } as Notifications.NotificationTriggerInput,
  });
}

export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('workout-reminder', {
      name: '訓練提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}
