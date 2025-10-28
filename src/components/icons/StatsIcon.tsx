import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

type Props = { color?: string; size?: number };

export default function StatsIcon({ color = '#666', size = 24 }: Props) {
  const w = size; const h = size;
  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={12} width={3} height={8} rx={1} stroke={color} strokeWidth={2} />
      <Rect x={10.5} y={8} width={3} height={12} rx={1} stroke={color} strokeWidth={2} />
      <Rect x={17} y={5} width={3} height={15} rx={1} stroke={color} strokeWidth={2} />
      <Path d="M3 21h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}


