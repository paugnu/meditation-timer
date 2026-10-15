import { setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';
import { ambienceNative } from './ambienceNative';

let configuration: Promise<void> | null = null;
/** The gong and ambience share one session; a gong must never disable background playback. */
export function configureAudio(): Promise<void> {
  return configuration ??= setAudioModeAsync({
    playsInSilentMode: true, shouldPlayInBackground: !!ambienceNative,
    // Only Android needs exclusive focus for its media service; iOS keeps mixing with other apps.
    interruptionMode: Platform.OS === 'android' ? 'doNotMix' : 'mixWithOthers',
  }).catch(error => { configuration = null; throw error; });
}
