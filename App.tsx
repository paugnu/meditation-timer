import { maybeRequestReview } from './src/services/reviews';
import { translator } from './src/i18n';
import { useFonts } from 'expo-font';
import { Raleway_400Regular } from '@expo-google-fonts/raleway/400Regular';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Modal, Text, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
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
  const headerOpacity = useRef(new Animated.Value(active ? 0 : 1)).current;
  useEffect(() => {
    const fade = Animated.timing(headerOpacity, {
      toValue: active ? 0 : 1, duration: 1200,
      easing: Easing.inOut(Easing.cubic), useNativeDriver: true, isInteraction: false,
    });
    fade.start();
    return () => fade.stop();
  }, [active, headerOpacity]);
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
  const size = Math.max(170, Math.min(width - 62, height * .42, 460));
  useEffect(() => {
    if (Platform.OS === 'android') void NavigationBar.setVisibilityAsync('visible').catch(() => {});
  }, []);
  return <SafeAreaView style={[styles.screen, { backgroundColor: bg }]}>
    <StatusBar style={dark ? 'light' : 'dark'} hidden={false}/>
    <Animated.View testID="app-header" style={[styles.header, { opacity: headerOpacity }]}>
      <Text style={[styles.appName, { color: palette.accent }]}>Meditation Timer · YogaBond</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t("Abrir ajustes")} accessibilityState={{ disabled: active || busy || !ready }} disabled={active || busy || !ready} onPress={() => setShowSettings(true)} style={[styles.iconButton, { borderColor: palette.line, backgroundColor: palette.surface }]}><Text style={{ color: palette.text, fontSize: 14 }}>{t("Ajustes")}</Text></Pressable>
    </Animated.View>
    {!ready ? <View style={styles.loading}><ActivityIndicator color={palette.accent}/></View> : <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
      <View style={styles.clockArea}><ClockFace key={meditation.sessionSequence} running={active} size={size} progress={1 - remainingMs / timer.durationMs} color={palette.accent}/></View>
      <View style={styles.readout}>
        <Pressable accessibilityRole="button" accessibilityLabel={active || paused ? t('Tiempo restante {time}', { time: formatTime(remainingMs) }) : t('Cambiar duración, {n} minutos', { n: settings.minutes })} disabled={active || paused || busy || !ready} onPress={() => setShowSettings(true)}>
          <Text testID="countdown" maxFontSizeMultiplier={1.3} style={[styles.time, { color: palette.accent, fontSize: Math.min(width * .205, 100) }]}>{formatTime(remainingMs)}</Text>
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={[styles.stateLabel, { color: muted }]}>{paused ? t("EN PAUSA") : completed ? t("SESIÓN COMPLETADA") : '\u00A0'}</Text>
      </View>
      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel={active ? t("Pausar meditación") : paused ? t("Continuar meditación") : completed ? t("Meditar de nuevo") : t("Iniciar meditación")} disabled={busy} onPress={() => { void (active ? meditation.pause() : meditation.start()); }} style={({ pressed }) => [styles.primaryButton, { backgroundColor: palette.button, opacity: pressed || busy ? .6 : 1 }]}>
          {busy ? <ActivityIndicator color={palette.onButton}/> : <Icon name={active ? 'pause' : 'play'} color={palette.onButton} size={24}/>}
        </Pressable>
        <View style={styles.finishSlot}>{(active || paused || completed) && <Pressable accessibilityRole="button" accessibilityLabel={t("Finalizar meditación")} disabled={busy} onPress={() => { void meditation.requestFinish(); }} style={styles.finishButton}><Text style={{ color: muted, fontSize: 14 }}>{t("Finalizar")}</Text></Pressable>}</View>
      </View>
    </ScrollView>}
      {!!meditation.notice && <View style={[styles.notice, { borderColor: palette.line, backgroundColor: palette.surface }]}><Text style={[styles.noticeText, { color: muted }]}>{t(meditation.notice)}</Text><Pressable accessibilityRole="button" accessibilityLabel={t("Cerrar aviso")} onPress={meditation.clearNotice} style={styles.dismiss}><Icon name="close" color={muted} size={18}/></Pressable></View>}
    <Modal visible={meditation.confirmFinish} transparent animationType="fade" onRequestClose={meditation.cancelFinish}>
      <View style={styles.confirmOverlay}>
        <View accessibilityViewIsModal style={[styles.confirmCard, { backgroundColor: palette.surface, borderColor: palette.line }]}>
          <Text accessibilityRole="header" style={[styles.confirmTitle, { color: palette.text }]}>{t('¿Guardar esta meditación?')}</Text>
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
  screen: { flex: 1 }, header: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 20, width: '100%', maxWidth: 680, alignSelf: 'center' },
  appName: { flexShrink: 1, marginRight: 12, fontSize: 21, fontWeight: '400', fontFamily: headingFont }, iconButton: { minWidth: 86, paddingHorizontal: 14, height: 44, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  loading: { flex: 1, justifyContent: 'center' }, scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: 100 },
  clockArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 18, paddingBottom: 18, minHeight: 200 },
  readout: { alignItems: 'center', paddingTop: 20 }, time: { fontWeight: '200', fontVariant: ['tabular-nums', 'lining-nums'], letterSpacing: -3 },
  stateLabel: { fontSize: 10, letterSpacing: 2, marginTop: 8, minHeight: 18 }, controls: { minHeight: 110, alignItems: 'center', marginTop: 22, marginBottom: 14 },
  primaryButton: { height: 58, width: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' }, finishButton: { minHeight: 48, minWidth: 100, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  finishSlot: { height: 56 },
  notice: { position: 'absolute', bottom: 16, alignSelf: 'center', maxWidth: 440, marginHorizontal: 24, borderWidth: 1, borderRadius: 10, paddingLeft: 14, flexDirection: 'row', alignItems: 'center' }, noticeText: { flex: 1, fontSize: 12, lineHeight: 19, paddingVertical: 12 }, dismiss: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
