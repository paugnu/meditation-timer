import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

const RADIUS = 126;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
function arc(radius: number, start: number, end: number) {
  const point = (angle: number) => [160 + radius * Math.cos(angle * Math.PI / 180), 160 + radius * Math.sin(angle * Math.PI / 180)];
  const a = point(start), b = point(end);
  return `M ${a[0]} ${a[1]} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${b[0]} ${b[1]}`;
}

export function ClockFace({ size, progress, color, running }: { size: number; progress: number; color: string; running: boolean }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const fraction = Math.max(0, Math.min(1, progress));
  useEffect(() => {
    let live = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (live) setReduceMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const state = AppState.addEventListener('change', value => setForeground(value === 'active'));
    return () => { live = false; motion.remove(); state.remove(); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    rotation.stopAnimation(value => {
      if (cancelled || !running || reduceMotion || !foreground) return;
      const turn = (from: number) => {
        Animated.timing(rotation, { toValue: 1, duration: 24000 * (1 - from), easing: Easing.linear, useNativeDriver: true, isInteraction: false }).start(({ finished }) => {
          if (!finished || cancelled) return;
          rotation.setValue(0);
          turn(0);
        });
      };
      turn(value);
    });
    return () => { cancelled = true; rotation.stopAnimation(); };
  }, [running, reduceMotion, foreground, rotation]);

  return <View testID="meditation-halo" accessible={false} pointerEvents="none" style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 320 320" accessible={false}>
      <Defs><RadialGradient id="halo" cx="50%" cy="50%" r="50%">
        <Stop offset="62%" stopColor={color} stopOpacity="0"/>
        <Stop offset="80%" stopColor={color} stopOpacity="0.065"/>
        <Stop offset="88%" stopColor={color} stopOpacity="0.025"/>
        <Stop offset="100%" stopColor={color} stopOpacity="0"/>
      </RadialGradient></Defs>
      <Circle cx="160" cy="160" r="157" fill="url(#halo)"/>
      <Circle cx="160" cy="160" r={RADIUS} fill="none" stroke={color} strokeWidth="1" opacity="0.16"/>
      {fraction > 0 && <G transform="rotate(-90 160 160)">
        <Circle cx="160" cy="160" r={RADIUS} fill="none" stroke={color} strokeWidth="7" opacity="0.06" strokeDasharray={[CIRCUMFERENCE * fraction, CIRCUMFERENCE]} strokeLinecap="round"/>
        <Circle testID="halo-progress" cx="160" cy="160" r={RADIUS} fill="none" stroke={color} strokeWidth="2" opacity="0.85" strokeDasharray={[CIRCUMFERENCE * fraction, CIRCUMFERENCE]} strokeLinecap="round"/>
      </G>}
    </Svg>
    <Animated.View testID="halo-orbit" style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
      <Svg width={size} height={size} viewBox="0 0 320 320" accessible={false}>
        {Array.from({ length: 32 }, (_, index) => {
          const opacity = .015 + Math.pow(index / 31, 2) * .4;
          const path = arc(136, -218 + index * 4, -214 + index * 4);
          return <G key={index}>
            <Path d={path} fill="none" stroke={color} strokeWidth="8" opacity={opacity * .09} strokeLinecap="round"/>
            <Path d={path} fill="none" stroke={color} strokeWidth="1.7" opacity={opacity} strokeLinecap="round"/>
          </G>;
        })}
        <Path d={arc(113, 35, 130)} fill="none" stroke={color} strokeWidth=".7" opacity=".12" strokeLinecap="round"/>
        <Circle testID="halo-tip" cx="160" cy="24" r="2" fill={color} opacity=".65"/>
      </Svg>
    </Animated.View>
  </View>;
}
