import React, { useMemo, useState } from 'react';

interface Point { date: string; count: number }

interface Props { data: Point[]; height?: number }

export const BallotsByDateChart: React.FC<Props> = ({ data, height = 220 }) => {
  const [hover, setHover] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  const chart = useMemo(() => {
    if (!data || data.length === 0) return null;
    // Remove left/right padding to let it stretch corner-to-corner
    const padding = { top: 20, right: 0, bottom: 40, left: 0 };
    const w = 1000; // Use a fixed coordinate system for the viewBox
    const h = height;
    const innerW = w - padding.left - padding.right;
    const innerH = h - padding.top - padding.bottom;
    const max = Math.max(...data.map(d => d.count), 1);

    // If only one data point, we need to handle it or it will crash / look weird
    const points = data.map((d, i) => {
      const x = data.length > 1 
        ? padding.left + (i / (data.length - 1)) * innerW
        : w / 2;
      const y = padding.top + (1 - d.count / max) * innerH;
      return { ...d, x, y };
    });

    // Generate smooth path
    const getSmoothPath = (pts: any[]) => {
      if (pts.length < 2) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const x_mid = (pts[i].x + pts[i+1].x) / 2;
        const y_mid = (pts[i].y + pts[i+1].y) / 2;
        path += ` Q ${pts[i].x} ${pts[i].y} ${x_mid} ${y_mid}`;
      }
      path += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
      return path;
    };

    const lineD = getSmoothPath(points);
    const areaD = `${lineD} L ${points[points.length - 1].x} ${h - padding.bottom} L ${points[0].x} ${h - padding.bottom} Z`;

    return { w, h, padding, points, lineD, areaD, max, innerH, innerW };
  }, [data, height]);

  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) + ' ' + 
           d.toLocaleTimeString(undefined, { hour: 'numeric', hour12: true }).toLowerCase().replace(' ', '');
  };

  if (!chart) return <div className="h-[220px] flex items-center justify-center text-gray-300">No submissions</div>;

  // Calculate tooltip orientation to prevent clipping
  const getTooltipStyle = (p: { x: number; y: number }) => {
    const isNearRight = p.x > chart.w * 0.8;
    const isNearLeft = p.x < chart.w * 0.2;
    
    let transform = 'translate(-50%, -100%)';
    if (isNearRight) transform = 'translate(-90%, -100%)';
    if (isNearLeft) transform = 'translate(-10%, -100%)';

    return {
        left: `${(p.x / chart.w) * 100}%`,
        top: p.y - 15,
        transform
    };
  };

  return (
    <div className="w-full relative group touch-none">
      <div className="relative">
        <svg 
          viewBox={`0 0 ${chart.w} ${chart.h}`} 
          width="100%" 
          height={chart.h} 
          className="block overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00AEEF" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <line
              key={i}
              x1={0}
              x2={chart.w}
              y1={chart.padding.top + t * chart.innerH}
              y2={chart.padding.top + t * chart.innerH}
              stroke="#E6EEF5"
              strokeWidth={1}
              strokeDasharray={i === 4 ? "0" : "4 4"}
            />
          ))}

          {/* area */}
          <path d={chart.areaD} fill="url(#areaGrad)" className="transition-all duration-500" />

          {/* professional bars (cones) for each data point */}
          <defs>
            <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00AEEF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00AEEF" stopOpacity="0" />
            </linearGradient>
          </defs>
          {chart.points.map((p, i) => (
            <rect
              key={`bar-${i}`}
              x={p.x - 2}
              y={p.y}
              width={4}
              height={chart.h - chart.padding.bottom - p.y}
              fill="url(#barGrad)"
              className="opacity-40"
            />
          ))}

          {/* line */}
          <path d={chart.lineD} fill="none" stroke="#00AEEF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* x-axis labels */}
          {chart.points.filter((_, i) => {
            const maxLabels = window.innerWidth < 768 ? 4 : 8; // Fewer labels on mobile
            return i % Math.max(1, Math.floor(chart.points.length / maxLabels)) === 0;
          }).map((p, i) => (
            <text 
              key={i} 
              x={p.x} 
              y={chart.h - 12} 
              textAnchor={i === 0 ? 'start' : i === chart.points.length - 1 ? 'end' : 'middle'} 
              fontSize={window.innerWidth < 768 ? 9 : 11} 
              fill="#94A3B8" 
              className="font-bold pointer-events-none"
            >
              {new Date(p.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
            </text>
          ))}

          {/* Interaction layer */}
          {chart.points.map((p, i) => (
            <rect
              key={`hit-${i}`}
              x={i === 0 ? 0 : p.x - (chart.innerW / Math.max(1, chart.points.length - 1)) / 2}
              y={0}
              width={chart.innerW / Math.max(1, chart.points.length - 1)}
              height={chart.h}
              fill="transparent"
              onMouseEnter={() => setHover({ x: p.x, y: p.y, date: p.date, count: p.count })}
              onMouseMove={() => setHover({ x: p.x, y: p.y, date: p.date, count: p.count })}
              onMouseLeave={() => setHover(null)}
              onTouchStart={() => setHover({ x: p.x, y: p.y, date: p.date, count: p.count })}
              className="cursor-pointer"
            />
          ))}

          {/* Hover points */}
          {hover && (
             <circle cx={hover.x} cy={hover.y} r={6} fill="#00AEEF" stroke="#fff" strokeWidth={2.5} className="pointer-events-none" />
          )}
        </svg>

        {/* tooltip */}
        {hover && (
          <div
            className="absolute bg-[#1A2533] text-white text-[11px] rounded shadow-2xl pointer-events-none z-50 flex flex-col items-center min-w-[110px] animate-in fade-in zoom-in duration-200"
            style={getTooltipStyle(hover)}
          >
            <div className="bg-black/30 w-full px-3 py-1.5 text-center rounded-t font-bold border-b border-white/10 uppercase tracking-tighter whitespace-nowrap">
                {formatLabel(hover.date)}
            </div>
            <div className="px-3 py-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#00AEEF] rounded-sm shadow-[0_0_8px_#00AEEF]"></div>
                <span className="whitespace-nowrap">Votes: <span className="font-bold text-[13px]">{hover.count}</span></span>
            </div>
            {/* arrow */}
            <div 
                className="w-2.5 h-2.5 bg-[#1A2533] rotate-45 absolute -bottom-1"
                style={{ 
                    left: hover.x > chart.w * 0.8 ? '80%' : hover.x < chart.w * 0.2 ? '20%' : '50%',
                    transform: 'translateX(-50%)'
                }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BallotsByDateChart;
