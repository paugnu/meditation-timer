import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
export type IconName = 'play' | 'pause' | 'close' | 'more' | 'back' | 'check' | 'sun' | 'moon';
export function Icon({ name, color = '#fff', size = 24 }: { name: IconName; color?: string; size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    {name === 'play' && <Path d="M8 5L19 12L8 19Z" fill={color} />}
    {name === 'pause' && <><Rect x="6" y="5" width="4" height="14" fill={color}/><Rect x="14" y="5" width="4" height="14" fill={color}/></>}
    {name === 'more' && [5,12,19].map(y => <Circle key={y} cx="12" cy={y} r="1.5" fill={color}/>)}
    {name === 'close' && <Path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="1.6"/>}
    {name === 'back' && <Path d="M14 5L7 12L14 19" fill="none" stroke={color} strokeWidth="1.7"/>}
    {name === 'check' && <Path d="M5 12L10 17L20 7" fill="none" stroke={color} strokeWidth="2"/>}
    {name === 'moon' && <Path d="M20 15A9 9 0 019 3A9 9 0 1020 15Z" fill="none" stroke={color} strokeWidth="1.5"/>}
    {name === 'sun' && <><Circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="1.5"/><Path d="M12 1V4M12 20V23M1 12H4M20 12H23M4 4L6 6M18 18L20 20M20 4L18 6M6 18L4 20" stroke={color} strokeWidth="1.5"/></>}
  </Svg>;
}
