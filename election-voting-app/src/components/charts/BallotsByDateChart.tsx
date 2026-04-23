import React, { useMemo, useState } from 'react';

interface Point { date: string; count: number }

interface Props { data: Point[]; height?: number }

export const BallotsByDateChart: React.FC<Props> = ({ data, height = 220 }) => {
  const [hover, setHover] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;
    const padding = { top: 16, right: 18, bottom: 28, left: 36 };
    const w = Math.max(320, data.length * 48);
    const h = height;
    const innerW = w - padding.left - padding.right;
    const innerH = h - padding.top - padding.bottom;
    const max = Math.max(...data.map(d => d.count), 1);

    const points = data.map((d, i) => {
      const x = padding.left + (i / Math.max(1, data.length - 1)) * innerW;
      const y = padding.top + (1 - d.count / max) * innerH;
      return { ...d, x, y };
    });

    // Line path
    const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    // Area path (down to bottom)
    const areaD = `${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')} L ${points[points.length - 1].x.toFixed(2)} ${padding.top + innerH} L ${points[0].x.toFixed(2)} ${padding.top + innerH} Z`;

    return { w, h, padding, points, lineD, areaD, max };
  }, [data, height]);

  if (!chart) return <div className="h-[220px] flex items-center justify-center text-gray-300">No submissions</div>;

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ width: chart.w }} className="relative">
        <svg viewBox={`0 0 ${chart.w} ${chart.h}`} width="100%" height={chart.h} className="block">
          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00AEEF" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line
              key={i}
              x1={chart.padding.left}
              x2={chart.w - chart.padding.right}
              y1={chart.padding.top + t * (chart.h - chart.padding.top - chart.padding.bottom)}
              y2={chart.padding.top + t * (chart.h - chart.padding.top - chart.padding.bottom)}
              stroke="#E6EEF5"
              strokeWidth={1}
            />
          ))}

          {/* area */}
          <path d={chart.areaD} fill="url(#areaGrad)" />

          {/* line */}
          <path d={chart.lineD} fill="none" stroke="#00AEEF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* points */}
          {chart.points.map((p) => (
            <g key={p.date} onMouseEnter={() => {
              setHover({ x: p.x, y: p.y, date: p.date, count: p.count });
            }} onMouseLeave={() => setHover(null)}>
              <circle cx={p.x} cy={p.y} r={4.5} fill="#00AEEF" stroke="#fff" strokeWidth={1.5} />
            </g>
          ))}

          {/* x-axis labels: show up to 6 labels */}
          {chart.points.filter((_, i) => {
            const maxLabels = Math.min(6, chart.points.length);
            return chart.points.length <= maxLabels ? true : (i % Math.ceil(chart.points.length / maxLabels) === 0);
          }).map((p) => (
            <text key={p.date} x={p.x} y={chart.h - 6} textAnchor="middle" fontSize={11} fill="#6B7280" className="font-sans">
              {new Date(p.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            </text>
          ))}
        </svg>

        {/* tooltip */}
        {hover && (
          <div
            className="absolute bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-md pointer-events-none"
            style={{ left: Math.max(8, Math.min(chart.w - 120, hover.x - 40)), top: hover.y - 42 }}
          >
            <div className="font-bold">{new Date(hover.date).toLocaleDateString()}</div>
            <div className="text-sm">Votes: {hover.count}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BallotsByDateChart;
