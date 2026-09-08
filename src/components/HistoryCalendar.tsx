import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MeditationRecord } from '../history';
import { dailyMeditation, dailyMinutes, localDayKey, monthDays } from '../calendar';
import { Settings } from '../settings';
import { localeFor, translator } from '../i18n';
import { appTheme } from '../theme';
import { Icon } from './Icon';

export function HistoryCalendar({ history, settings, selectedDay, onSelect }: { history: MeditationRecord[]; settings: Settings; selectedDay: Date; onSelect: (date: Date) => void }) {
  const month = selectedDay;
  const totals = useMemo(() => dailyMeditation(history), [history]);
  const { text, muted, accent, line } = appTheme(settings);
  const locale = localeFor(settings.language), t = translator(settings.language);
  const today = new Date(), todayKey = localDayKey(today);
  const days = monthDays(month.getFullYear(), month.getMonth());
  const shift = (delta: number) => onSelect(new Date(month.getFullYear(), month.getMonth() + delta, 1, 12));
  return <View testID="history-calendar" style={[styles.calendar, { borderColor: line }]}>
    <View style={styles.navigation}><Text style={[styles.eyebrow, { color: muted, flex: 1 }]}>{t('CALENDARIO')}</Text><Pressable accessibilityRole="button" onPress={() => onSelect(new Date())} style={styles.today}><Text style={{ color: accent }}>{t('Hoy')}</Text></Pressable></View>
    <View style={styles.navigation}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Mes anterior')} onPress={() => shift(-1)} style={styles.arrow}><Icon name="back" color={text} size={20}/></Pressable>
      <Text testID="calendar-month" accessibilityRole="header" style={[styles.month, { color: text }]}>{month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t('Mes siguiente')} onPress={() => shift(1)} style={styles.arrow}><View style={{ transform: [{ rotate: '180deg' }] }}><Icon name="back" color={text} size={20}/></View></Pressable>
    </View>
    <View style={styles.week}>{Array.from({ length: 7 }, (_, index) => {
      const date = new Date(2024, 0, 1 + index, 12);
      return <Text key={index} accessibilityLabel={date.toLocaleDateString(locale, { weekday: 'long' })} style={[styles.weekday, { color: muted }]}>{date.toLocaleDateString(locale, { weekday: 'short' })}</Text>;
    })}</View>
    {Array.from({ length: days.length / 7 }, (_, row) => <View key={row} style={styles.week}>{days.slice(row * 7, row * 7 + 7).map((date, column) => {
      if (!date) return <View key={`empty-${column}`} style={styles.cell}/>;
      const key = localDayKey(date), ms = totals.get(key) ?? 0;
      const minutes = dailyMinutes(ms, locale), isToday = key === todayKey, selected = key === localDayKey(selectedDay);
      return <Pressable onPress={() => onSelect(date)} accessibilityRole="button" accessibilityState={{ selected }} aria-pressed={selected} key={key} testID={`calendar-day-${key}`} accessible accessibilityLabel={`${date.toLocaleDateString(locale, { dateStyle: 'full' })}${ms > 0 ? `, ${minutes} ${t('min')}` : ''}${isToday ? `, ${t('Hoy')}` : ''}`} style={({ pressed }) => [styles.cell, { opacity: pressed ? .55 : 1 }]}>
        <View style={[styles.dayCircle, { borderColor: selected ? accent : 'transparent' }]}>
          <Text style={{ color: selected ? accent : text, fontSize: 14, fontWeight: selected ? '600' : '400' }}>{date.getDate()}</Text>
          {isToday && <View style={[styles.todayDot, { backgroundColor: accent }]}/>}
        </View>
        {ms > 0 && <Text testID="calendar-minutes" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.8} style={[styles.minutes, { color: accent }]}>{minutes} {t('min')}</Text>}
      </Pressable>;
    })}</View>)}
    <Text style={[styles.note, { color: muted }]}>{t('Minutos por día. Cada sesión cuenta en el día en que empezó.')}</Text>
  </View>;
}
const styles = StyleSheet.create({
  calendar: { borderTopWidth: 1, marginTop: 16, paddingTop: 4 },
  eyebrow: { fontSize: 11, letterSpacing: 2 }, navigation: { flexDirection: 'row', alignItems: 'center', marginVertical: 0 },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, month: { flex: 1, textAlign: 'center', fontSize: 17 },
  week: { flexDirection: 'row' }, weekday: { flex: 1, textAlign: 'center', fontSize: 11, paddingVertical: 10 },
  cell: { flex: 1, minWidth: 0, minHeight: 62, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  todayDot: { position: 'absolute', bottom: 2, width: 3, height: 3, borderRadius: 1.5 },
  minutes: { fontSize: 10, lineHeight: 14, marginTop: 3, textAlign: 'center' }, today: { minHeight: 44, minWidth: 56, alignItems: 'center', justifyContent: 'center' },
  note: { fontSize: 12, lineHeight: 19, marginTop: 12 },
});
