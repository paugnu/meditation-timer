import { Settings } from './settings';

// YogaBond earth tones with locally bundled Raleway headings.
export const headingFont = 'Raleway_400Regular';
export function appTheme(settings: Settings) {
  const dark = settings.theme === 'dark';
  return {
    background: dark ? '#181613' : '#F7F3EB',
    surface: dark ? '#201D19' : '#FCF9F3',
    text: dark ? '#EEE7DC' : '#342C25',
    muted: dark ? '#B0A598' : '#776B5E',
    line: dark ? '#40372E' : '#DED3C4',
    accent: settings.color === '#85471E' && dark ? '#D7A17C' : settings.color,
    button: dark ? '#D7A17C' : '#85471E',
    onButton: dark ? '#241B15' : '#FFF9F0',
  };
}
