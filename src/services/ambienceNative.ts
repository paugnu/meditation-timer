import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import type { AudioPlayer } from 'expo-audio';

type AmbienceModule = {
  setTarget(player: AudioPlayer, targetVolume: number, holdUntil: number, endsAt: number | null): Promise<void>;
  remove(player: AudioPlayer): Promise<void>;
};
export const ambienceNative = Platform.OS === 'web' ? null : requireOptionalNativeModule<AmbienceModule>('MeditationAudio');
