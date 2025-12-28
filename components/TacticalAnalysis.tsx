
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TacticalAnalysisProps {
  history: number[]; // Array of completion percentages for each past day
  currentDay: number;
  madaraPower: number; // Current shifting power level
  totalDays: number; // Dynamic total days from selected plan
}

const TacticalAnalysis: React.FC<TacticalAnalysisProps> = ({ history, currentDay, madaraPower, totalDays }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartHeight = 220;
  const chartWidth = 360;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (day: number) => {
    const divisor = totalDays || 1;
    return (day / divisor) * innerWidth + paddingLeft || paddingLeft;
  };
  const getY = (percentage: number) => {
    return innerHeight - (percentage / 100) * innerHeight + paddingTop || paddingTop;
  };

  // 1. Madara's Path (Dynamic Power)
  const madaraPathSolid = useMemo(() => {
    let d = `M ${getX(0)} ${getY(0)}`;
    // Sync Madara EXACTLY with User History Length
    const plotLimit = history.length;

    for (let i = 1; i <= plotLimit; i++) {
      // Last point uses current Power, previous points use history jitter
      const isLast = i === plotLimit;
      const val = isLast ? madaraPower : (100 - (Math.sin(i) * 5 + 5));
      d += ` L ${getX(i)} ${getY(val)}`;
    }
    return d;
  }, [history.length, madaraPower, totalDays]);

  const madaraPathFuture = useMemo(() => {
    const plotLimit = history.length;
    // Future path starts where solid path ends
    const startY = plotLimit === 0 ? 0 : madaraPower;
    let d = `M ${getX(plotLimit)} ${getY(startY)}`;

    for (let i = plotLimit + 1; i <= totalDays; i++) {
      d += ` L ${getX(i)} ${getY(100)}`;
    }
    return d;
  }, [history.length, madaraPower, totalDays]);

  // 2. User's Path (The Reality) - Returns Daily Efficiency Snapshot
  const userPath = useMemo(() => {
    let d = `M ${getX(0)} ${getY(0)}`;

    history.forEach((h, i) => {
      // h is now the daily percentage (0-100)
      d += ` L ${getX(i + 1)} ${getY(h)}`;
    });
    return d;
  }, [history, totalDays]);

  // Calculate current user progress based on last history snapshot (Daily Efficiency)
  const userProgress = history.length > 0 ? history[history.length - 1] : 0;
  const isLegendary = userProgress >= 80;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chartWidth;
    const day = Math.round(((x - paddingLeft) / innerWidth) * totalDays);
    if (day >= 0 && day <= history.length) {
      setHoverIndex(day);
    } else {
      setHoverIndex(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border-zinc-800/60 relative overflow-hidden flex flex-col">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="font-legendary text-xs text-zinc-400 tracking-[0.3em] uppercase">Tactical Dominance</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-rose-600 animate-pulse uppercase tracking-widest">
            LIVE GAP: {Math.max(0, Math.round(madaraPower - userProgress))}%
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-[16/10]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y-Axis Grid Lines */}
          {[0, 50, 100].map((tick) => (
            <g key={tick}>
              <text x={paddingLeft - 12} y={getY(tick) + 4} textAnchor="end" className="fill-zinc-700 text-[9px] font-mono">{tick}%</text>
              <line x1={paddingLeft} y1={getY(tick)} x2={chartWidth - paddingRight} y2={getY(tick)} stroke="#1f1f23" strokeWidth="1" strokeDasharray="4 4" />
            </g>
          ))}

          <path d={madaraPathFuture} fill="none" stroke="#e11d48" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />

          <motion.path
            d={madaraPathSolid}
            fill="none"
            stroke="#e11d48"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 6px rgba(225, 29, 72, 0.4))' }}
          />

          <motion.path
            key={`user-path-${totalDays}`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            d={userPath}
            fill="none"
            stroke={isLegendary ? "#3b82f6" : "#ffffff"}
            strokeWidth="3"
            style={{
              filter: isLegendary
                ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))'
                : 'drop-shadow(0 0 6px rgba(255,255,255,0.3))'
            }}
          />

          <motion.circle
            initial={{ r: 4, opacity: 0.8 }}
            animate={{ r: [4, 5.5, 4], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            cx={getX(history.length) || paddingLeft}
            cy={getY(madaraPower) || paddingTop}
            r={4.5}
            fill="#e11d48"
          />
          <circle
            cx={getX(history.length) || paddingLeft}
            cy={getY(userProgress) || paddingTop}
            r={5}
            fill={isLegendary ? "#3b82f6" : "#ffffff"}
          />

          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)} y1={paddingTop} x2={getX(hoverIndex)} y2={innerHeight + paddingTop}
              stroke="white" strokeWidth="1" strokeDasharray="2 2" opacity="0.2"
            />
          )}
        </svg>

        <AnimatePresence>
          {hoverIndex !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-0 right-0 p-3 bg-zinc-950 border border-rose-600/50 rounded-lg shadow-2xl z-20 pointer-events-none"
            >
              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2 border-b border-zinc-900 pb-1">Day {hoverIndex} Analysis</div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[9px] text-rose-500 font-bold uppercase">Madara:</span>
                  <span className="text-[11px] font-mono text-white">
                    {hoverIndex === currentDay ? madaraPower.toFixed(1) : (hoverIndex === 0 ? 0 : (100 - (Math.sin(hoverIndex) * 5 + 5)).toFixed(1))}%
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase">You:</span>
                  <span className="text-[11px] font-mono text-white">
                    {hoverIndex === 0 ? 0 : Math.round(history[hoverIndex - 1] || 0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-8 border-t border-zinc-900/50 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shadow-[0_0_8px_#e11d48]" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            Madara <span className="text-zinc-600">(Shifting Will)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isLegendary ? 'bg-blue-500' : 'bg-white'}`} />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            You <span className="text-zinc-600">({isLegendary ? 'Legend' : 'Challenger'})</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TacticalAnalysis;
