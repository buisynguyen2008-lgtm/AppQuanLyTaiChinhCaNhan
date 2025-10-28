import React from 'react';
import Svg, { Path } from 'react-native-svg';

type DonutDatum = {
  value: number;
  color: string;
};

export type DonutChartProps = {
  data: DonutDatum[];
  size?: number; // total width/height
  innerRadius?: number; // inner hole radius
  outerRadius?: number; // pie outer radius
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 220, innerRadius = 40, outerRadius }) => {
  const total = data.reduce((s, d) => s + (d.value > 0 ? d.value : 0), 0) || 1;
  const radius = outerRadius ?? size / 2 - 8; // small padding
  const cx = size / 2;
  const cy = size / 2;
  const isPie = !innerRadius || innerRadius <= 0;

  let currentAngle = 0;
  const paths = data.map((d, idx) => {
    const raw = d.value > 0 ? d.value : 0;
    const angle = (raw / total) * 360;
    if (angle <= 0) return null;

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const largeArcFlag = angle > 180 ? 1 : 0;

    const outerStart = polarToCartesian(cx, cy, radius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, radius, endAngle);
    let dPath: string;
    if (isPie) {
      // Draw a wedge from center
      dPath = [
        `M ${cx} ${cy}`,
        `L ${outerStart.x} ${outerStart.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
        'Z',
      ].join(' ');
    } else {
      const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
      const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
      dPath = [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
        'Z',
      ].join(' ');
    }

    return <Path key={idx} d={dPath} fill={d.color} />;
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
      {paths}
    </Svg>
  );
};

export default React.memo(DonutChart);
