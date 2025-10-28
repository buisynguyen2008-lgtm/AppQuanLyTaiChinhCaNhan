import React from 'react';
import DonutChart from './DonutChart';

export type PieDatum = {
  label: string;
  value: number;
  color?: string;
};

export type PieChartProps = {
  data: PieDatum[];
  size?: number;
  innerRadius?: number; // 0 => pie, >0 => donut
  preferVictory?: boolean; // default false; use fallback unless explicitly requested
};

const PieChart: React.FC<PieChartProps> = ({ data, size = 220, innerRadius = 0, preferVictory = false }) => {
  // Try to use victory-native composable API if available (opt-in)
  if (preferVictory) try {
    // Dynamic require to avoid hard dependency at runtime
    // @ts-ignore - dynamic require for optional dependency
    const victory = require('victory-native');
    const PolarChart = victory?.PolarChart;
    const Pie = victory?.Pie;
    if (PolarChart && Pie && Pie.Chart) {
      return (
        <PolarChart
          data={data}
          labelKey="label"
          valueKey="value"
          colorKey="color"
          width={size}
          height={size}
        >
          {/* Some versions may not accept innerRadius here; if unsupported, Victory will ignore it safely */}
          <Pie.Chart innerRadius={innerRadius} />
        </PolarChart>
      );
    }
  } catch {
    // fallthrough to SVG fallback
  }

  // Fallback to SVG-based chart (works everywhere)
  return (
    <DonutChart
      data={data.map((d) => ({ value: d.value, color: d.color || '#9AA0A6' }))}
      size={size}
      innerRadius={innerRadius}
    />
  );
};

export default React.memo(PieChart);
