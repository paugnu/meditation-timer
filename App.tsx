import { maybeRequestReview } from './src/services/reviews';
import { ambienceLabels, stepAmbience } from './src/ambience';
import { useAmbience } from './src/hooks/useAmbience';
import { translator } from './src/i18n';
import { useFonts } from 'expo-font';
import { Raleway_400Regular } from '@expo-google-fonts/raleway/400Regular';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, PanResponder, Text, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ClockFace } from './src/components/ClockFace';
import { Icon } from './src/components/Icon';
import { SettingsPanel } from './src/components/SettingsPanel';
import { useMeditation } from './src/hooks/useMeditation';
import { formatTime } from './src/timer';
import { appTheme, headingFont } from './src/theme';

function MeditationScreen() {
  const meditation = useMeditation();
  const { settings, timer, remainingMs, busy, ready } = meditation;
  const t = translator(settings.language);
  const [showSettings, setShowSettings] = useState(false);
  const { width, height } = useWindowDimensions();
  const active = timer.status === 'running';
  const chromeOpacity = useRef(new Animated.Value(active ? 0 : 1)).current;
  useEffect(() => {
    const fade = Animated.timing(chromeOpacity, {
      toValue: active ? 0 : 1, duration: 1200,
      easing: Easing.inOut(Easing.cubic), useNativeDriver: true, isInteraction: false,
    });
    fade.start();
    return () => fade.stop();
  }, [active, chromeOpacity]);
  const paused = timer.status === 'paused';
  const completed = timer.status === 'completed';
  const dark = settings.theme === 'dark';
  const palette = appTheme(settings);
  const bg = palette.background;
  const muted = palette.muted;
  const completedCount = meditation.history.filter(record => record.completed).length;
  useEffect(() => {
    if (!ready || busy || active || paused || showSettings || meditation.confirmFinish) return;
    let cancelled = false;
    // Allow the final gong and a quiet moment before asking; never interrupt a session.
    const timeout = setTimeout(() => { void maybeRequestReview(completedCount, () => !cancelled); }, completed ? 18000 : 2000);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [ready, busy, active, paused, completed, showSettings, meditation.confirmFinish, completedCount]);
  const cycleAmbience = (step: number) => meditation.updateSettings({ ambience: stepAmbience(settings.ambience, step) });
  const cycle = useRef(cycleAmbience);
  cycle.current = cycleAmbience;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderRelease: (_, gesture) => { if (gesture.dx <= -36) cycle.current(1); else if (gesture.dx >= 36) cycle.current(-1); },
  })).current;
  useAmbience(settings.ambience, active, settings.volume, meditation.ambienceHold, meditation.notify);
  const wide = height < 560 && width > height;
  const size = wide
    ? Math.max(120, Math.min(width * .42, height * .62, 460))
    : Math.max(170, Math.min(width - 62, height * .42, 460));
  useEffect(() => {
    if (Platform.OS === 'android') void NavigationBar.setVisibilityAsync('visible').catch(() => {});
  }, []);
  return <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>
    <StatusBar style={dark ? 'light' : 'dark'} hidden={false}/>
    {!ready ? <View style={styles.loading}><ActivityIndicator color={palette.accent}/></View> : <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
      <View style={[styles.layout, wide && styles.layoutWide]}>
      <View style={[styles.clockArea, wide && styles.clockAreaWide]}><ClockFace key={meditation.sessionSequence} running={active} size={size} progress={1 - remainingMs / timer.durationMs} color={palette.accent}/></View>
      <View style={wide ? styles.panelWide : styles.panel}>
      <View style={styles.readout}>
        <Pressable accessibilityRole="button" accessibilityLabel={active || paused ? t('Tiempo restante {time}', { time: formatTime(remainingMs) }) : t('Cambiar duración, {n} minutos', { n: settings.minutes })} disabled={active || paused || busy || !ready} onPress={() => setShowSettings(true)}>
          <Text testID="countdown" maxFontSizeMultiplier={1.3} style={[styles.time, { color: palette.accent, fontSize: Math.min(width * (wide ? .1 : .205), 100) }]}>{formatTime(remainingMs)}</Text>
        </Pressable>
        <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.5} style={[styles.stateLabel, { color: muted }]}>{paused ? t("EN PAUSA") : completed ? t("SESIÓN COMPLETADA") : '\u00A0'}</Text>
      </View>
      <View style={[styles.controls, wide && styles.controlsWide]}>
        <Pressable accessibilityRole="button" accessibilityLabel={active ? t("Pausar meditación") : paused ? t("Continuar meditación") : completed ? t("Meditar de nuevo") : t("Iniciar meditación")} disabled={busy} onPress={() => { void (active ? meditation.pause() : meditation.start()); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: palette.button, opacity: pressed || busy ? .6 : 1 }]}>
          {busy ? <ActivityIndicator color={palette.onButton}/> : <Icon name={active ? 'pause' : 'play'} color={palette.onButton} size={24}/>}
        </Pressable>
        <View style={styles.finishSlot}>{(paused || completed) && <Pressable accessibilityRole="button" accessibilityLabel={t("Finalizar meditación")} disabled={busy} onPress={() => { void meditation.requestFinish(); }} style={styles.finishButton}><Text maxFontSizeMultiplier={1.5} style={{ color: muted, fontSize: 14 }}>{t("Finalizar")}</Text></Pressable>}</View>
        <Text maxFontSizeMultiplier={1.4} style={[styles.ambienceEyebrow, wide && styles.eyebrowWide, { color: muted }]}>{t("SONIDO DE FONDO")}</Text>
        <View accessible accessibilityRole="adjustable" accessibilityLabel={t("Sonido de fondo")} accessibilityValue={{ text: t(ambienceLabels[settings.ambience]) }} accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]} onAccessibilityAction={event => cycleAmbience(event.nativeEvent.actionName === 'decrement' ? -1 : 1)} style={styles.ambience} {...pan.panHandlers}>
          <Pressable accessibilityElementsHidden importantForAccessibility="no" onPress={() => cycleAmbience(-1)} hitSlop={6} testID="ambience-back" style={({ pressed }) => [styles.chevron, { opacity: pressed ? 1 : .45 }]}><Icon name="back" color={muted} size={15}/></Pressable>
          <Text testID="ambience-label" numberOfLines={1} maxFontSizeMultiplier={1.3} style={[styles.ambienceLabel, { color: muted }]}>{t(ambienceLabels[settings.ambience])}</Text>
          <Pressable accessibilityElementsHidden importantForAccessibility="no" onPress={() => cycleAmbience(1)} hitSlop={6} testID="ambience-forward" style={({ pressed }) => [styles.chevron, { opacity: pressed ? 1 : .45 }]}><Icon name="forward" color={muted} size={15}/></Pressable>
        </View>
        <Animated.View style={{ opacity: chromeOpacity }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Abrir ajustes")} accessibilityState={{ disabled: active || busy || !ready }} disabled={active || busy || !ready} onPress={() => setShowSettings(true)} style={({ pressed }) => [styles.gear, wide && styles.gearWide, { opacity: pressed ? .5 : 1 }]}><Icon name="settings" color={muted} size={21}/></Pressable>
        </Animated.View>
      </View>
      </View>
      </View>
    </ScrollView>}
      {!!meditation.notice && <View style={[styles.notice, { borderColor: palette.line, backgroundColor: palette.surface }]}><Text maxFontSizeMultiplier={1.6} style={[styles.noticeText, { color: muted }]}>{t(meditation.notice)}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("Cerrar aviso")} onPress={meditation.clearNotice} style={styles.dismiss}><Icon name="close" color={muted} size={18}/></Pressable></View>}
    <Modal visible={meditation.confirmFinish} transparent animationType="fade" onRequestClose={meditation.cancelFinish}>
      <View style={styles.confirmOverlay}>
        <View accessibilityViewIsModal style={[styles.confirmCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.5} style={[styles.confirmTitle, { color: palette.text }]}>{t('¿Guardar esta meditación?')}</Text>
          <Text style={[styles.noticeText, { color: muted }]}>{t('La sesión está en pausa. Puedes guardar el tiempo meditado o finalizar sin guardarlo.')}</Text>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void meditation.resolveFinish(true); }} style={[styles.confirmAction, { backgroundColor: palette.button }]}><Text style={{ color: palette.onButton }}>{t('Guardar meditación')}</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void meditation.resolveFinish(false); }} style={styles.confirmAction}><Text style={{ color: palette.text }}>{t('Finalizar sin guardar')}</Text></Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={meditation.cancelFinish} style={styles.confirmAction}><Text style={{ color: muted }}>{t('Cancelar')}</Text></Pressable>
        </View>
      </View>
    </Modal>
    <SettingsPanel visible={showSettings} settings={settings} history={meditation.history} deleteRecord={meditation.deleteRecord} inProgress={paused} update={meditation.updateSettings} close={() => setShowSettings(false)} testSound={meditation.playGong}/>
  </SafeAreaView>;
}
export default function App() {
  const [loaded, error] = useFonts({ Raleway_400Regular });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: '#181613', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#D7A17C"/></View>;
  return <SafeAreaProvider><MeditationScreen/></SafeAreaProvider>;
}
const styles = StyleSheet.create({
  confirmOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center', padding: 24 },
  confirmCard: { width: '100%', maxWidth: 400, padding: 24, borderRadius: 20, borderWidth: 1 },
  confirmTitle: { fontSize: 22, fontFamily: headingFont },
  confirmAction: { minHeight: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginTop: 8 },
  screen: { flex: 1 },
  layout: { width: '100%', alignItems: 'center', flexGrow: 1 },
  layoutWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
  panel: { alignItems: 'center', width: '100%' },
  panelWide: { alignItems: 'center', flexShrink: 1 },
  // flex: 0 would keep a zero basis and let the halo overflow onto the panel.
  clockAreaWide: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', minHeight: 0, paddingVertical: 0 },
  ambience: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  ambienceEyebrow: { fontSize: 9, letterSpacing: 2, opacity: .3, marginTop: 16 },
  chevron: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  // A fixed width keeps the arrows still while the name changes length.
  ambienceLabel: { fontSize: 13.5, letterSpacing: .3, opacity: .75, width: 170, textAlign: 'center' },
  gear: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  gearWide: { height: 38, marginTop: 0 },
  eyebrowWide: { marginTop: 4 },
  controlsWide: { minHeight: 0, marginTop: 4, marginBottom: 0 },
  loading: { flex: 1, justifyContent: 'center' }, scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: 100 },
  clockArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 18, paddingBottom: 18, minHeight: 200 },
  readout: { alignItems: 'center', paddingTop: 20 }, time: { fontWeight: '200', fontVariant: ['tabular-nums', 'lining-nums'], letterSpacing: -3 },
  stateLabel: { fontSize: 10, letterSpacing: 2, marginTop: 8, minHeight: 18 }, controls: { minHeight: 110, alignItems: 'center', marginTop: 18, marginBottom: 14 },
  primaryButton: { height: 58, width: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }, finishButton: { minHeight: 48, minWidth: 100, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  finishSlot: { height: 56 },
  notice: { position: 'absolute', bottom: 16, alignSelf: 'center', maxWidth: 440, marginHorizontal: 24, borderWidth: 1, borderRadius: 10, paddingLeft: 14, flexDirection: 'row', alignItems: 'center' }, noticeText: { flex: 1, fontSize: 12, lineHeight: 19, paddingVertical: 12 }, dismiss: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
