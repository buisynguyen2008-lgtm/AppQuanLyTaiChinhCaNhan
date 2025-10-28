import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { CartesianChart, Bar } from 'victory-native';

export type BarChartProps = {
  data: Array<Record<string, any>>;
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
  rounded?: number;
  preferFallback?: boolean;
  // Tinh chỉnh độ dày và khoảng cách cột cho fallback SVG
  barGap?: number; // khoảng cách giữa các cột trong cùng một nhóm
  maxBarWidth?: number; // độ dày tối đa của 1 cột
  groupInnerRatio?: number; // tỉ lệ bề rộng nhóm dành cho cột (0..1)
};

// Wrapper ưu tiên dùng Victory composable API (CartesianChart/Bar). Nếu không có, fallback SVG để vẫn hiển thị cột.
const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKeys,
  colors = ['#2a7', '#d33'],
  height = 260,
  rounded = 8,
  preferFallback = false,
  barGap = 6,
  maxBarWidth = 14,
  groupInnerRatio = 0.6,
}) => {
  // Hooks cần đặt ở đầu để đảm bảo đúng thứ tự gọi
  const [width, setWidth] = React.useState<number>(0);
  const onLayout = React.useCallback((e: any) => {
    const w = e?.nativeEvent?.layout?.width || 0;
    if (w !== width) setWidth(w);
  }, [width]);
  if (!preferFallback && CartesianChart && Bar) {
    return (
      <CartesianChart data={data} xKey={xKey} yKeys={yKeys} height={height}>
        {({ points, chartBounds }: any) => (
          <>
            {yKeys.map((key, idx) => (
              <Bar
                key={String(key)}
                points={points[key]}
                chartBounds={chartBounds}
                color={colors[idx % colors.length]}
                roundedCorners={{ topLeft: rounded, topRight: rounded }}
              />
            ))}
          </>
        )}
      </CartesianChart>
    );
  }

  // Fallback nếu Victory không sẵn sàng: vẽ grouped bars đơn giản bằng SVG
  

  // Tính scale
  const margin = { top: 12, right: 12, bottom: 20, left: 12 };
  const innerHeight = height - margin.top - margin.bottom;
  let maxVal = 0;
  for (const row of data) {
    for (const key of yKeys) {
      const v = Number(row[key] ?? 0);
      if (v > maxVal) maxVal = v;
    }
  }
  const safeMax = maxVal > 0 ? maxVal : 1;

  // Nếu chưa có width (chưa layout), render container để lấy kích thước
  if (width <= 0) {
    return <View style={{ height }} onLayout={onLayout} />;
  }

  // Tính kích thước cột
  const innerWidth = width - margin.left - margin.right;
  const groupCount = Math.max(1, data.length);
  const seriesCount = Math.max(1, yKeys.length);
  const groupWidth = innerWidth / groupCount;
  const occupiedWidth = Math.max(0, groupWidth * groupInnerRatio - (seriesCount - 1) * barGap);
  const singleBarWidth = Math.max(2, Math.min(maxBarWidth, occupiedWidth / seriesCount));

  const scaleY = (val: number) => (val / safeMax) * innerHeight;

  return (
    <View style={{ height }} onLayout={onLayout}>
      <Svg width={width} height={height}>
        <G x={margin.left} y={margin.top}>
          {data.map((row, gi) => {
            const gx = gi * groupWidth;
            return (
              <G key={`g-${gi}`} x={gx}>
                {yKeys.map((key, si) => {
                  const val = Number(row[key] ?? 0);
                  const h = scaleY(val);
                  const x = si * (singleBarWidth + barGap);
                  const y = innerHeight - h;
                  const fill = colors[si % colors.length];
                  return (
                    <Rect
                      key={`b-${gi}-${si}`}
                      x={x}
                      y={y}
                      width={singleBarWidth}
                      height={h}
                      rx={rounded}
                      ry={rounded}
                      fill={fill}
                    />
                  );
                })}
                {/* Nhãn trục X đơn giản */}
                <SvgText x={0} y={innerHeight + 14} fill="#666" fontSize="10" textAnchor="start">
                  {String(row[xKey])}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default React.memo(BarChart);
