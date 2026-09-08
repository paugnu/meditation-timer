import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
export type IconName = 'play' | 'pause' | 'close' | 'more' | 'back' | 'forward' | 'check' | 'sun' | 'moon' | 'settings';
export function Icon({ name, color = '#fff', size = 24 }: { name: IconName; color?: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    {name === 'play' && <Path d="M8 5L19 12L8 19Z" fill={color} />}
    {name === 'pause' && <><Rect x="6" y="5" width="4" height="14" fill={color}/><Rect x="14" y="5" width="4" height="14" fill={color}/></>}
    {name === 'more' && [5,12,19].map(y => <Circle key={y} cx="12" cy={y} r="1.5" fill={color}/>)}
    {name === 'close' && <Path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="1.6"/>}
    {name === 'back' && <Path d="M14 5L7 12L14 19" fill="none" stroke={color} strokeWidth="1.7"/>}
    {name === 'forward' && <Path d="M10 5L17 12L10 19" fill="none" stroke={color} strokeWidth="1.7"/>}
    {name === 'settings' && <><Path d="M 20.77 9.98 L 20.77 14.02 L 18.44 14.47 L 18.30 14.81 L 19.63 16.77 L 16.77 19.63 L 14.81 18.30 L 14.47 18.44 L 14.02 20.77 L 9.98 20.77 L 9.53 18.44 L 9.19 18.30 L 7.23 19.63 L 4.37 16.77 L 5.70 14.81 L 5.56 14.47 L 3.23 14.02 L 3.23 9.98 L 5.56 9.53 L 5.70 9.19 L 4.37 7.23 L 7.23 4.37 L 9.19 5.70 L 9.53 5.56 L 9.98 3.23 L 14.02 3.23 L 14.47 5.56 L 14.81 5.70 L 16.77 4.37 L 19.63 7.23 L 18.30 9.19 L 18.44 9.53 Z" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/><Circle cx="12" cy="12" r="3.1" fill="none" stroke={color} strokeWidth="1.4"/></>}
    {name === 'check' && <Path d="M5 12L10 17L20 7" fill="none" stroke={color} strokeWidth="2"/>}
    {name === 'moon' && <Path d="M20 15A9 9 0 019 3A9 9 0 1020 15Z" fill="none" stroke={color} strokeWidth="1.5"/>}
    {name === 'sun' && <><Circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="1.5"/><Path d="M12 1V4M12 20V23M1 12H4M20 12H23M4 4L6 6M18 18L20 20M20 4L18 6M6 18L4 20" stroke={color} strokeWidth="1.5"/></>}
  </Svg>;
}
