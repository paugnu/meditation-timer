import { translator, languages } from '../i18n';
import { appTheme, headingFont } from '../theme';
import React, { useEffect, useState } from 'react';
import { AppState, Keyboard, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, Switch, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { COLORS, Settings } from '../settings';
import { focus } from '../services/focus';
import { Icon } from './Icon';
import { MeditationRecord } from '../history';
import { HistoryPanel } from './HistoryPanel';

type Props = { visible: boolean; settings: Settings; history: MeditationRecord[]; deleteRecord: (id: string) => void; inProgress: boolean; update: (patch: Partial<Settings>) => void; close: () => void; testSound: () => Promise<boolean> };
export function SettingsPanel({ visible, settings, history, deleteRecord, inProgress, update, close, testSound }: Props) {
  const t = translator(settings.language);
  const dark = settings.theme === 'dark';
  const bg = appTheme(settings).surface;
  const palette = appTheme(settings);
  const { text, muted, line, accent } = palette;
  const [section, setSection] = useState<'settings' | 'history'>('settings');
  const [minutes, setMinutes] = useState(String(settings.minutes));
  const [error, setError] = useState('');
  const [soundError, setSoundError] = useState('');
  const [testingSound, setTestingSound] = useState(false);
  const [access, setAccess] = useState(focus.hasAccess());
  const [exact, setExact] = useState(focus.canScheduleExact());
  useEffect(() => { if (visible) { setSection('settings'); setSoundError(''); setMinutes(String(settings.minutes)); setError(''); setAccess(focus.hasAccess()); setExact(focus.canScheduleExact()); } }, [visible]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', status => {
      if (status === 'active') { setAccess(focus.hasAccess()); setExact(focus.canScheduleExact()); }
    });
    return () => subscription.remove();
  }, []);
  const applyMinutes = () => {
    const n = Number(minutes);
    if (!/^\d+$/.test(minutes) || !Number.isInteger(n) || n < 1 || n > 180) {
      setError('Elige una duración entre 1 y 180 minutos.'); return false;
    }
    update({ minutes: n }); setError(''); return true;
  };
  const dismiss = () => {
    const n = Number(minutes);
    if (/^\d+$/.test(minutes) && Number.isInteger(n) && n >= 1 && n <= 180) update({ minutes: n });
    Keyboard.dismiss();
    close();
  };
  const previewSound = async () => {
    if (testingSound) return;
    setTestingSound(true); setSoundError('');
    try {
      if (!(await testSound())) setSoundError('No se ha podido reproducir el gong. Comprueba el volumen y vuelve a intentarlo.');
    } finally { setTestingSound(false); }
  };
  const heading = (label: string) => <Text style={[styles.sectionTitle, { color: muted }]}>{label}</Text>;
  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void, detail?: string) =>
    <View style={[styles.row, { borderColor: line }]}>
      <View style={styles.rowText}><Text style={[styles.label, { color: text }]}>{label}</Text>{detail && <Text style={[styles.detail, { color: muted }]}>{detail}</Text>}</View>
      <Switch accessibilityLabel={label} value={value} onValueChange={onChange} trackColor={{ false: dark ? '#383838' : '#D4D4D4', true: accent }} thumbColor="#FFFFFF" />
    </View>;
  const button = (label: string, onPress: () => void) => <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.linkButton, { opacity: pressed ? .5 : 1 }]}><Text style={{ color: accent, fontSize: 15 }}>{label}</Text></Pressable>;

  return <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={dismiss}>
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.header, { borderColor: line }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: text }]}>{t("Ajustes")}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Cerrar ajustes")} onPress={dismiss} style={({ pressed }) => [styles.iconButton, { opacity: pressed ? .5 : 1 }]}><Icon name="close" color={text}/></Pressable>
        </View>
        <View style={[styles.tabs, { borderColor: line }]}>
          {(['settings', 'history'] as const).map(tab => <Pressable key={tab} accessibilityRole="tab" accessibilityLabel={tab === 'settings' ? t("Configuración") : t("Registro")} accessibilityState={{ selected: section === tab }} onPress={() => { if (section === 'history' || applyMinutes()) setSection(tab); }} style={[styles.tab, { borderColor: section === tab ? accent : 'transparent' }]}>
            <Text style={{ color: section === tab ? accent : muted, fontSize: 15 }}>{tab === 'settings' ? t("Configuración") : t("Registro")}</Text>
          </Pressable>)}
        </View>
        {section === 'history' ? <HistoryPanel history={history} settings={settings} deleteRecord={deleteRecord}/> : <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {heading(t('Idioma'))}
          <View accessibilityRole="radiogroup" accessibilityLabel={t('Idioma')} style={styles.languages}>{languages.map(language => <Pressable key={language.code} accessibilityRole="radio" accessibilityLabel={language.name} accessibilityState={{ checked: settings.language === language.code }} aria-checked={settings.language === language.code} onPress={() => update({ language: language.code })} style={[styles.language, { borderColor: settings.language === language.code ? accent : line, backgroundColor: settings.language === language.code ? `${accent}18` : 'transparent' }]}><Text style={{ color: settings.language === language.code ? accent : text, fontSize: 14 }}>{language.name}</Text></Pressable>)}</View>
          {heading(t("TIEMPO"))}
          {inProgress && <Text style={[styles.detail, { color: muted }]}>{t("Los cambios de duración se aplican a la próxima meditación.")}</Text>}
          <View style={[styles.row, { borderColor: line }]}>
            <Text style={[styles.label, { color: text }]}>{t("Duración")}</Text>
            <View style={styles.inline}>
              <TextInput accessibilityLabel={t("Duración en minutos")} keyboardType="number-pad" inputMode="numeric" selectTextOnFocus maxLength={3} value={minutes} onChangeText={setMinutes} onBlur={applyMinutes} onSubmitEditing={applyMinutes} style={[styles.input, { color: accent, borderColor: line }]} />
              <Text style={{ color: muted }}>{t("min")}</Text>
            </View>
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{t(error)}</Text>}
          <View style={styles.presets}>{[5,10,15,30,45,60].map(n => <Pressable key={n} accessibilityRole="button" accessibilityLabel={t('{n} minutos', { n })} accessibilityState={{ selected: Number(minutes) === n }} onPress={() => { setMinutes(String(n)); update({ minutes: n }); setError(''); }} style={[styles.chip, { borderColor: Number(minutes) === n ? accent : line, backgroundColor: Number(minutes) === n ? `${accent}18` : 'transparent' }]}><Text style={{ color: Number(minutes) === n ? accent : muted }}>{n}</Text></Pressable>)}</View>

          {heading(t("SONIDO"))}
          {toggle(t("Gong al inicio"), settings.gongStart, gongStart => update({ gongStart }), t("Suena al empezar una nueva meditación."))}
          {toggle(t("Gong al final"), settings.gong, gong => update({ gong }), t("Suena al completar el tiempo elegido."))}
          <Text style={[styles.detail, { color: muted }]}>{t("Gong de meditación · Marble Toast (CC0).")}</Text>
          <>
            <View style={[styles.row, { borderBottomWidth: 0 }]}><Text style={[styles.label, { color: text }]}>{t("Volumen")}</Text><Text style={{ color: muted }}>{Math.round(settings.volume * 100)} %</Text></View>
            <Slider accessibilityLabel={t("Volumen del gong")} accessibilityValue={{ min: 0, max: 100, now: Math.round(settings.volume * 100), text: t('{n} por ciento', { n: Math.round(settings.volume * 100) }) }} minimumValue={0} maximumValue={1} step={.05} value={settings.volume} onValueChange={volume => update({ volume })} minimumTrackTintColor={accent} maximumTrackTintColor={line} thumbTintColor={accent} style={{ height: 40 }} />
            <Pressable accessibilityRole="button" accessibilityLabel={t("Escuchar gong")} disabled={testingSound} onPress={() => { void previewSound(); }} style={styles.linkButton}><Text style={{ color: accent, fontSize: 15 }}>{testingSound ? t("Preparando gong…") : t("Escuchar gong")}</Text></Pressable>
            {!!soundError && <Text accessibilityRole="alert" style={styles.error}>{t(soundError)}</Text>}
            <Text style={[styles.detail, { color: muted }]}>{t("Con la pantalla bloqueada, el volumen del aviso depende de los ajustes del sistema.")}</Text>
          </>

          {heading(t("PANTALLA"))}
          <Text style={[styles.label, { color: text, marginTop: 18 }]}>{t("Tema")}</Text>
          <View style={styles.themes}>{(['dark','light'] as const).map(theme => <Pressable key={theme} accessibilityRole="button" accessibilityLabel={theme === 'dark' ? t("Tema noche") : t("Tema día")} accessibilityState={{ selected: settings.theme === theme }} onPress={() => update({ theme })} style={[styles.theme, { borderColor: settings.theme === theme ? accent : line, backgroundColor: theme === 'dark' ? '#181613' : '#F7F3EB' }]}><Icon name={theme === 'dark' ? 'moon' : 'sun'} color={theme === 'dark' ? '#DDD' : '#333'}/><Text style={{ color: theme === 'dark' ? '#DDD' : '#333' }}>{theme === 'dark' ? t("Noche") : t("Día")}</Text>{settings.theme === theme && <Icon name="check" color={accent} size={18}/>}</Pressable>)}</View>
          <Text style={[styles.label, { color: text, marginTop: 8 }]}>{t("Color del reloj")}</Text>
          <View style={styles.colors}>{COLORS.map(color => <Pressable key={color.name} accessibilityRole="button" accessibilityLabel={t('Color {name}', { name: t(color.name) })} accessibilityState={{ selected: settings.color === color.value }} onPress={() => update({ color: color.value })} style={[styles.swatch, { borderColor: settings.color === color.value ? color.value : 'transparent' }]}><View style={[styles.swatchInner, { backgroundColor: color.value }]}>{settings.color === color.value && <Icon name="check" color="#080808" size={20}/>}</View></Pressable>)}</View>
          {toggle(t("Mantener pantalla encendida"), settings.keepAwake, keepAwake => update({ keepAwake }), t("Solo mientras el temporizador está en marcha."))}

          {heading(t("SIN INTERRUPCIONES"))}
          {Platform.OS === 'android' && focus.available ? <>
            {toggle(t("Activar No molestar"), settings.dnd, dnd => update({ dnd }), t("Durante la sesión. Se restaura al pausar o terminar. Las alarmas siguen permitidas."))}
            {!access && button(t("Permitir acceso a No molestar"), focus.openAccessSettings)}
            {!exact && button(t("Permitir alarmas y recordatorios"), focus.openAlarmSettings)}
            <Text style={[styles.detail, { color: muted }]}>{access && exact ? t("Permisos concedidos.") : t("Concede ambos permisos para activar y restaurar No molestar automáticamente.")}</Text>
          </> : <Text style={[styles.paragraph, { color: muted }]}>{Platform.OS === 'ios' ? t("Antes de empezar, activa No molestar desde el Centro de control → Concentración. iOS no permite que la app lo active automáticamente. Permite los avisos de esta app si quieres escuchar el gong con la pantalla bloqueada.") : Platform.OS === 'android' ? t("No molestar automático está disponible en la versión Android instalada, fuera de Expo Go. Mientras tanto, actívalo desde los ajustes rápidos del teléfono.") : t("En esta vista web, activa No molestar en tu dispositivo. Para escuchar el gong, mantén esta pestaña abierta; los avisos con la pantalla bloqueada están disponibles en Android e iOS.")}</Text>}
          {Platform.OS !== 'web' && button(t("Abrir ajustes de la aplicación"), () => { void Linking.openSettings().catch(() => setError('No se han podido abrir los ajustes del dispositivo.')); })}
          <View style={[styles.footer, { borderColor: line }]}><Text style={{ color: text, fontSize: 14 }}>Meditation Timer · YogaBond</Text><Text style={[styles.detail, { color: muted }]}>{t("Tu tiempo. Tu práctica.")}</Text><Pressable accessibilityRole="link" accessibilityLabel={t('Una app de YogaBond')} onPress={() => { void Linking.openURL('https://www.yogabond.es/').catch(() => setError('No se ha podido abrir la web de YogaBond.')); }} style={styles.linkButton}><Text style={{ color: accent, fontSize: 14 }}>{t('Una app de YogaBond')} ↗</Text></Pressable>{[['Política de privacidad', 'privacy#meditation-timer'], ['Ayuda y contacto', '#meditation-timer-support']].map(([label, path]) => <Pressable key={label} accessibilityRole="link" accessibilityLabel={t(label)} onPress={() => { void Linking.openURL(`https://www.yogabond.es/${settings.language}${path.startsWith('#') ? '' : '/'}${path}`).catch(() => setError('No se ha podido abrir la web de YogaBond.')); }} style={styles.linkButton}><Text style={{ color: accent, fontSize: 14 }}>{t(label)} ↗</Text></Pressable>)}<Text style={[styles.detail, { color: muted, marginTop: 12 }]}>{t("Sin anuncios, cuentas ni meditaciones guiadas.")}{"\n"}{t("Tus preferencias y meditaciones se guardan en este dispositivo.")}</Text></View>
        </ScrollView>}
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}
const styles = StyleSheet.create({
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  language: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderRadius: 8 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 26 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 52, borderBottomWidth: 2 },
  container: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 26, paddingRight: 12, height: 68, borderBottomWidth: 1 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: headingFont, fontSize: 25, flex: 1, fontWeight: '400' }, headerHint: { fontSize: 9, letterSpacing: 1.5 },
  content: { paddingHorizontal: 26, paddingBottom: 32 }, sectionTitle: { fontSize: 11, letterSpacing: 2, marginTop: 32, marginBottom: 6 },
  row: { minHeight: 68, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, borderBottomWidth: 1 },
  rowText: { flex: 1 }, label: { fontSize: 16 }, detail: { fontSize: 12, lineHeight: 19, marginTop: 6 }, paragraph: { fontSize: 14, lineHeight: 23, marginTop: 16 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 10 }, input: { width: 65, borderWidth: 1, borderRadius: 8, fontSize: 23, textAlign: 'center', paddingVertical: 9 },
  presets: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 16 }, chip: { minWidth: 42, minHeight: 44, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  linkButton: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' }, themes: { flexDirection: 'row', gap: 12, marginVertical: 16 },
  theme: { flex: 1, minHeight: 65, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  colors: { flexDirection: 'row', gap: 16, marginTop: 16, marginBottom: 10 }, swatch: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }, swatchInner: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#D75A50', fontSize: 13, marginTop: 10 }, footer: { marginTop: 32, paddingTop: 24, borderTopWidth: 1 },
});
