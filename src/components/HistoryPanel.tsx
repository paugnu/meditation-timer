import { HistoryCalendar } from './HistoryCalendar';
import { translator, localeFor } from '../i18n';
import { appTheme, headingFont } from '../theme';
import React, { useState } from 'react';
import { localDayKey } from '../calendar';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMeditated, MeditationRecord } from '../history';
import { Settings } from '../settings';

export function HistoryPanel({ history, settings, deleteRecord }: { history: MeditationRecord[]; settings: Settings; deleteRecord: (id: string) => void }) {
  const t = translator(settings.language);
  const locale = localeFor(settings.language);
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const dailyHistory = history.filter(record => localDayKey(new Date(record.startedAt)) === localDayKey(selectedDay));
  const dailyTotal = dailyHistory.reduce((sum, record) => sum + record.durationMs, 0);
  const palette = appTheme(settings);
  const { text, muted, line, accent } = palette;
  const total = history.reduce((sum, r) => sum + r.durationMs, 0);
  return <FlatList data={dailyHistory} keyExtractor={item => item.id} contentContainerStyle={styles.content}
    ListHeaderComponent={<>
      <Text style={[styles.eyebrow, { color: muted }]}>{t("TU PRÁCTICA")}</Text>
      <Text testID="history-total" style={[styles.total, { color: accent }]}>{formatMeditated(total, settings.language)}</Text>
      <Text style={[styles.subtitle, { color: muted }]}>{t("Tiempo total meditado")}</Text>
      <Text testID="history-count" style={[styles.count, { color: text }]}>{t('Sesiones: {n}', { n: history.length })}</Text>
      <HistoryCalendar history={history} settings={settings} selectedDay={selectedDay} onSelect={day => { setSelectedDay(day); setPendingDelete(null); }}/>
      <Text testID="selected-day-heading" accessibilityRole="header" style={[styles.section, { color: text, borderColor: line }]}>{selectedDay.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
      {dailyHistory.length > 0 && <Text testID="selected-day-total" style={[styles.subtitle, { color: accent }]}>{formatMeditated(dailyTotal, settings.language)} · {t('Sesiones: {n}', { n: dailyHistory.length })}</Text>}
    </>}
    ListEmptyComponent={<View style={styles.empty}>
      <Text style={[styles.emptyTitle, { color: text }]}>{t(history.length ? 'No hay meditaciones este día' : 'Tu primera meditación empieza aquí')}</Text>
      <Text style={[styles.explanation, { color: muted }]}>{t(history.length ? 'Elige otro día para consultar tu práctica.' : 'Al completar o finalizar una sesión, aparecerá aquí con su fecha y el tiempo que has meditado.')}</Text>
    </View>}
    renderItem={({ item }) => <View testID="history-entry" style={[styles.entry, { borderColor: line }]}>
      <View style={styles.entryTop}>
        <Text style={[styles.date, { color: text }]}>{new Date(item.startedAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        <Text style={{ color: muted, fontSize: 13 }}>{new Date(item.startedAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      <Text style={[styles.duration, { color: accent }]}>{formatMeditated(item.durationMs, settings.language)}</Text>
      <Text style={[styles.explanation, { color: muted }]}>{item.completed ? t("Completada") : t("Finalizada antes de tiempo")} · {t('Objetivo')}: {formatMeditated(item.plannedDurationMs, settings.language)}</Text>
      {pendingDelete === item.id ? <View style={[styles.confirmation, { borderColor: line }]}>
        <Text accessibilityRole="alert" style={[styles.explanation, { color: text }]}>{t('¿Eliminar esta meditación? Se descontará del tiempo meditado. Esta acción no se puede deshacer.')}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => setPendingDelete(null)} style={styles.action}><Text style={{ color: text }}>{t('Cancelar')}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { deleteRecord(item.id); setPendingDelete(null); }} style={styles.action}><Text style={{ color: accent }}>{t('Eliminar definitivamente')}</Text></Pressable>
        </View>
      </View> : <Pressable accessibilityRole="button" onPress={() => setPendingDelete(item.id)} style={[styles.action, { alignSelf: 'flex-end' }]}><Text style={{ color: muted }}>{t('Eliminar registro')}</Text></Pressable>}
    </View>}
    ListFooterComponent={<Text style={[styles.footer, { color: muted }]}>{t("Tu registro se guarda solo en este dispositivo.")}</Text>}
  />;
}
const styles = StyleSheet.create({
  confirmation: { borderTopWidth: 1, marginTop: 12, paddingTop: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10 },
  content: { padding: 16, paddingBottom: 40 }, eyebrow: { fontSize: 11, letterSpacing: 2, marginTop: 8 },
  total: { fontSize: 26, fontWeight: '300', marginTop: 8 }, subtitle: { fontSize: 14, marginTop: 6 },
  count: { fontSize: 14, marginTop: 8 }, explanation: { fontSize: 13, lineHeight: 21, marginTop: 6 },
  section: { borderTopWidth: 1, paddingTop: 16, marginTop: 16, marginBottom: 4, fontSize: 17 },
  entry: { paddingVertical: 20, borderBottomWidth: 1 }, entryTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  date: { fontSize: 14, flex: 1 }, duration: { fontSize: 24, fontWeight: '300', marginTop: 12 },
  empty: { paddingVertical: 16 }, emptyTitle: { fontFamily: headingFont, fontSize: 21, lineHeight: 26 }, footer: { fontSize: 12, marginTop: 30 },
});
