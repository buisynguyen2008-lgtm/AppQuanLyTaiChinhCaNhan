import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { color?: string; size?: number };

export default function TransactionsIcon({ color = '#666', size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 7h11l-3-3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 17H6l3 3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 7v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M17 11v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}


