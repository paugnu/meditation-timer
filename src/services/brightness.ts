import { Platform } from 'react-native';
import * as Brightness from 'expo-brightness';
import { BrightnessDriver } from '../brightness';

export const brightnessDriver: BrightnessDriver = {
  capture: async () => ({
    level: await Brightness.getBrightnessAsync(),
    system: Platform.OS === 'android' && await Brightness.isUsingSystemBrightnessAsync(),
  }),
  set: level => Brightness.setBrightnessAsync(level),
  restore: async (snapshot, dimLevel) => {
    if (Platform.OS === 'android' && snapshot.system) await Brightness.restoreSystemBrightnessAsync();
    else {
      // Locking iOS or a manual adjustment may already have replaced our brightness.
      const current = await Brightness.getBrightnessAsync();
      if (Math.abs(current - dimLevel) < .02) await Brightness.setBrightnessAsync(snapshot.level);
    }
  },
};
