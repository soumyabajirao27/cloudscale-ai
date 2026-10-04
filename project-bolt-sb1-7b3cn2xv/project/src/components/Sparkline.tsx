interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color, width = 80, height = 28 }: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((d, i) => {
    const x = i * step;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const id = `spark-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
