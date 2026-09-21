import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Settings } from '../settings';
import { translator } from '../i18n';
import { appTheme, headingFont } from '../theme';

const ROW = 48;
export function DurationPicker({ settings, save, close }: { settings: Settings; save: (minutes: number) => void; close: () => void }) {
  const t = translator(settings.language), palette = appTheme(settings);
  const [minutes, setMinutes] = useState(settings.minutes);
  const wheel = useRef<ScrollView>(null);
  const initialized = useRef(false);
  const snap = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (snap.current) clearTimeout(snap.current); }, []);
  const choose = (n: number) => {
    if (snap.current) clearTimeout(snap.current);
    const next = Math.max(1, Math.min(180, n));
    setMinutes(next); wheel.current?.scrollTo({ y: (next - 1) * ROW, animated: false });
  };
  return <Modal transparent animationType="fade" onRequestClose={close}>
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Cancelar')} onPress={close} style={StyleSheet.absoluteFill}/>
      <View accessibilityViewIsModal style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.line }]}>
        <ScrollView bounces={false} contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={[styles.title, { color: palette.text }]}>{t('Duración')}</Text>
          <View style={styles.presets}>{[5,10,15,30,45,60].map(n => <Pressable key={n} accessibilityRole="button" accessibilityLabel={t('{n} minutos', { n })} onPress={() => save(n)} style={[styles.chip, { borderColor: palette.line }]}><Text style={{ color: palette.accent }}>{n} {t('min')}</Text></Pressable>)}</View>
          <Text style={[styles.hint, { color: palette.muted }]}>{t('Duración en minutos')}</Text>
          <View accessible accessibilityRole="adjustable" accessibilityLabel={t('Duración en minutos')} accessibilityValue={{ min: 1, max: 180, now: minutes, text: t('{n} minutos', { n: minutes }) }} accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]} onAccessibilityAction={event => choose(minutes + (event.nativeEvent.actionName === 'decrement' ? -1 : 1))} style={styles.wheel}>
            <View pointerEvents="none" style={[styles.selection, { borderColor: palette.accent, backgroundColor: `${palette.accent}12` }]}/>
            <ScrollView ref={wheel} testID="duration-wheel" nestedScrollEnabled showsVerticalScrollIndicator={false} snapToInterval={ROW} decelerationRate="fast" bounces={false} contentContainerStyle={{ paddingVertical: ROW }} onLayout={() => { if (!initialized.current) { initialized.current = true; wheel.current?.scrollTo({ y: (settings.minutes - 1) * ROW, animated: false }); } }} scrollEventThrottle={16} onScroll={event => {
              const next = Math.max(1, Math.min(180, Math.round(event.nativeEvent.contentOffset.y / ROW) + 1));
              setMinutes(next);
              // React Native Web does not implement snapToInterval.
              if (Platform.OS === 'web') {
                if (snap.current) clearTimeout(snap.current);
                snap.current = setTimeout(() => wheel.current?.scrollTo({ y: (next - 1) * ROW, animated: false }), 120);
              }
            }}>
              {Array.from({ length: 180 }, (_, i) => i + 1).map(n => <Pressable key={n} accessible={false} onPress={() => choose(n)} style={styles.wheelRow}><Text maxFontSizeMultiplier={1.2} style={{ color: n === minutes ? palette.accent : palette.muted, fontSize: n === minutes ? 30 : 22, opacity: n === minutes ? 1 : .45 }}>{n}</Text></Pressable>)}
            </ScrollView>
          </View>
          <View style={styles.adjust}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Reducir duración')} disabled={minutes === 1} onPress={() => choose(minutes - 1)} style={styles.step}><Text style={{ color: palette.accent, fontSize: 24 }}>−</Text></Pressable>
            <Text accessibilityLiveRegion="polite" style={{ color: palette.muted }}>{t('{n} minutos', { n: minutes })}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('Aumentar duración')} disabled={minutes === 180} onPress={() => choose(minutes + 1)} style={styles.step}><Text style={{ color: palette.accent, fontSize: 24 }}>+</Text></Pressable>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" onPress={() => save(minutes)} style={[styles.action, { backgroundColor: palette.button }]}><Text style={{ color: palette.onButton }}>{t('Guardar duración')}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={close} style={styles.action}><Text style={{ color: palette.muted }}>{t('Cancelar')}</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, maxHeight: '100%', borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  content: { padding: 24, paddingBottom: 0 }, title: { fontFamily: headingFont, fontSize: 24, textAlign: 'center' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 },
  chip: { flexBasis: '30%', flexGrow: 1, minHeight: 44, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  hint: { textAlign: 'center', marginTop: 24, marginBottom: 8, fontSize: 12 },
  wheel: { height: ROW * 3, width: 160, alignSelf: 'center', overflow: 'hidden' },
  wheelRow: { height: ROW, justifyContent: 'center', alignItems: 'center' },
  selection: { position: 'absolute', top: ROW, height: ROW, width: '100%', borderTopWidth: 1, borderBottomWidth: 1, borderRadius: 8 },
  adjust: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  step: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  action: { minHeight: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
});
