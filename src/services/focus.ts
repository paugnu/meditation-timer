import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
type FocusModule = {
  hasAccess(): boolean;
  canScheduleExact(): boolean;
  openAccessSettings(): void;
  openAlarmSettings(): void;
  begin(endsAt: number): void;
  end(): void;
};
const native = Platform.OS === 'android' ? requireOptionalNativeModule<FocusModule>('MeditationFocus') : null;
export const focus = {
  available: !!native,
  hasAccess: () => native?.hasAccess() ?? false,
  canScheduleExact: () => native?.canScheduleExact() ?? false,
  openAccessSettings: () => native?.openAccessSettings(),
  openAlarmSettings: () => native?.openAlarmSettings(),
  begin: (endsAt: number) => native?.begin(endsAt),
  end: () => native?.end(),
};
