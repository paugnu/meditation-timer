import { translator } from '../i18n';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Settings } from '../settings';
const ID = 'meditation-completion';
// Foreground completion is handled by our audio player; never play two gongs.
if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }),
});
export async function prepareAlerts(language: Settings['language'] = 'es'): Promise<boolean> {
  const t = translator(language);
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meditation-gong-v1', {
      name: t("Fin de meditación · gong"), importance: Notifications.AndroidImportance.HIGH,
      sound: 'gong.wav', enableVibrate: false, bypassDnd: true,
      audioAttributes: { usage: Notifications.AndroidAudioUsage.ALARM, contentType: Notifications.AndroidAudioContentType.SONIFICATION },
    });
    await Notifications.setNotificationChannelAsync('meditation-silent-v1', {
      name: t("Fin de meditación · silencio"), importance: Notifications.AndroidImportance.DEFAULT,
      sound: null, enableVibrate: false,
    });
  }
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  return permission.granted;
}
export async function cancelAlert() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(ID);
  await Notifications.dismissNotificationAsync(ID);
}
export async function scheduleAlert(endsAt: number, settings: Settings) {
  if (Platform.OS === 'web') return;
  const t = translator(settings.language);
  const sound = settings.gong && settings.volume > 0;
  await Notifications.scheduleNotificationAsync({
    identifier: ID,
    content: { title: t("Meditación terminada"), body: t("Tómate un momento antes de continuar."), sound: sound ? 'gong.wav' : false },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endsAt), channelId: sound ? 'meditation-gong-v1' : 'meditation-silent-v1' },
  });
}
