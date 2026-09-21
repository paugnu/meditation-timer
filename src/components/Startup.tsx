import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ClockFace } from './ClockFace';

void SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: false });

export function Startup({ ready, finish }: { ready: boolean; finish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [laidOut, setLaidOut] = useState(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (live) setReduceMotion(value); }).catch(() => { if (live) setReduceMotion(true); });
    return () => { live = false; };
  }, []);
  useEffect(() => {
    if (!ready || !laidOut || reduceMotion === null) return;
    const fade = Animated.timing(opacity, { toValue: 0, duration: reduceMotion ? 0 : 450, useNativeDriver: true });
    fade.start(({ finished }) => { if (finished) finish(); });
    return () => fade.stop();
  }, [ready, laidOut, reduceMotion, opacity, finish]);
  return <Animated.View testID="startup-halo" onLayout={() => { void SplashScreen.hideAsync().catch(() => {}); setLaidOut(true); }} style={[StyleSheet.absoluteFill, { backgroundColor: '#181613', justifyContent: 'center', alignItems: 'center', opacity }]}>
    <ClockFace id="startup" size={200} progress={0} color="#D7A17C" running/>
  </Animated.View>;
}
