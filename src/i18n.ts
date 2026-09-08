import es from './locales/es.json';
import ca from './locales/ca.json';
import en from './locales/en.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';

export const languages = [
  { code: 'es', name: 'Español', locale: 'es-ES' },
  { code: 'ca', name: 'Català / Valencià', locale: 'ca-ES-valencia' },
  { code: 'en', name: 'English', locale: 'en-GB' },
  { code: 'nl', name: 'Nederlands', locale: 'nl-NL' },
  { code: 'fr', name: 'Français', locale: 'fr-FR' },
  { code: 'ru', name: 'Русский', locale: 'ru-RU' },
] as const;
export type Language = typeof languages[number]['code'];
export const dictionaries = { es, ca, en, nl, fr, ru };
export function validLanguage(value: unknown): Language {
  return languages.some(l => l.code === value) ? value as Language : 'es';
}
export function localeFor(language: Language) {
  return languages.find(l => l.code === language)!.locale;
}
export function translator(language: Language) {
  const messages: Record<string, string> = dictionaries[language];
  return (key: string, values: Record<string, string | number> = {}) =>
    (messages[key] ?? key).replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match));
}
