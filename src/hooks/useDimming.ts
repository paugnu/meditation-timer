import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { brightnessController } from '../brightness';
import { brightnessDriver } from '../services/brightness';

export function useDimming(enabled: boolean, running: boolean, endsAt: number | null, notify: (message: string) => void) {
  const [dimmed, setDimmed] = useState(false);
  const notice = useRef(notify); notice.current = notify;
  const [setBrightness] = useState(() => brightnessController(brightnessDriver, () => notice.current('No se ha podido ajustar el brillo de la pantalla.')));
  const interaction = useRef(() => {});
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let foreground = AppState.currentState === 'active' || Platform.OS === 'web';
    const restore = () => {
      clearTimeout(timeout); setDimmed(false);
      if (Platform.OS !== 'web') void setBrightness(false);
    };
    const wake = () => {
      restore();
      if (!enabled || !running || !foreground || endsAt === null || endsAt <= Date.now()) return;
      timeout = setTimeout(() => {
        if (endsAt <= Date.now()) return;
        setDimmed(true);
        if (Platform.OS !== 'web') void setBrightness(true);
      }, 10000);
    };
    interaction.current = wake;
    wake();
    const listener = AppState.addEventListener('change', state => {
      foreground = state === 'active';
      wake();
    });
    return () => { interaction.current = () => {}; listener.remove(); restore(); };
  }, [enabled, running, endsAt, setBrightness]);
  return { dimmed, wake: () => interaction.current(), touch: () => { if (!dimmed) interaction.current(); } };
}
