import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = { color?: string; size?: number };

export default function SettingsIcon({ color = '#666', size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l1.5 2.5 2.9.5-.9 2.7.9 2.8-2.9.5L12 15l-1.5-2.5-2.9-.5.9-2.8-.9-2.7 2.9-.5L12 3z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Circle cx={12} cy={11} r={2.5} stroke={color} strokeWidth={2} />
    </Svg>
  );
}


