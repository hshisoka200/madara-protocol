
import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Shield, Layers, Scroll, Ghost, Flame, Info } from 'lucide-react';
import { Rank } from '../types';
import { RANK_THRESHOLDS } from '../constants';

interface ShinobiStatusCardProps {
  lifetimeDays: number;
}

const ShinobiStatusCard: React.FC<ShinobiStatusCardProps> = ({ lifetimeDays }) => {
  const [prevRank, setPrevRank] = useState<Rank | null>(null);
  const [showRankUp, setShowRankUp] = useState(false);

  const rankData = useMemo(() => {
    if (lifetimeDays <= RANK_THRESHOLDS.ACADEMY) {
      return { name: 'Academy Student' as Rank, icon: <Leaf size={20} />, color: '#71717a', next: RANK_THRESHOLDS.ACADEMY + 1, prev: 0 };
    }
    if (lifetimeDays <= RANK_THRESHOLDS.GENIN) {
      return { name: 'Genin / 1-Tomoe' as Rank, icon: <Shield size={20} />, color: '#3b82f6', next: RANK_THRESHOLDS.GENIN + 1, prev: RANK_THRESHOLDS.ACADEMY };
    }
    if (lifetimeDays <= RANK_THRESHOLDS.CHUNIN) {
      return { name: 'Chunin / Mangekyō' as Rank, icon: <Layers size={20} />, color: '#22c55e', next: RANK_THRESHOLDS.CHUNIN + 1, prev: RANK_THRESHOLDS.GENIN };
    }
    return { name: 'Eternal Legend / Perfect Susanoo' as Rank, icon: <Flame size={20} />, color: '#e11d48', next: 1000, prev: RANK_THRESHOLDS.CHUNIN };
  }, [lifetimeDays]);

  useEffect(() => {
    if (prevRank && prevRank !== rankData.name) {
      setShowRankUp(true);
      setTimeout(() => setShowRankUp(false), 1500);
    }
    setPrevRank(rankData.name);
  }, [rankData.name]);

  const nextRankProgress = useMemo(() => {
    const current = lifetimeDays;
    const target = rankData.next;
    const prevThreshold = rankData.prev;
    // Calculate progress between previous threshold and next threshold
    if (target === 1000) return 100; // Max rank
    return Math.min(Math.max(0, ((current - prevThreshold) / (target - prevThreshold)) * 100), 100);
  }, [lifetimeDays, rankData]);

  const isHighRank = rankData.name === 'Chunin / Mangekyō' || rankData.name === 'Eternal Legend / Perfect Susanoo';

  return (
    <motion.div
      className="glass-card rounded-2xl p-5 border-rose-600/20 relative overflow-hidden group mb-6"
      whileHover={{ scale: 1.02 }}
    >
      {/* Shimmer Effect for high ranks */}
      {isHighRank && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Rank Up Flash */}
      <AnimatePresence>
        {showRankUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-20 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800"
            style={{ color: rankData.color, boxShadow: `0 0 10px ${rankData.color}22` }}
          >
            {rankData.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Shinobi Status</span>
            <motion.h4
              key={rankData.name}
              initial={showRankUp ? { scale: 1.5, opacity: 0 } : {}}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-legendary italic"
              style={{ color: rankData.color, textShadow: `0 0 12px ${rankData.color}66` }}
            >
              {rankData.name}
            </motion.h4>
          </div>
        </div>

        <div className="relative group/tooltip">
          <Info size={14} className="text-zinc-600 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-30 uppercase tracking-wider leading-relaxed">
            Your discipline determines your standing in the Uchiha hierarchy.
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end text-[9px] font-bold uppercase tracking-widest text-zinc-500">
          <span>Rank Mastery</span>
          <span>{rankData.name === 'Eternal Legend / Perfect Susanoo' ? 'MAX' : `${Math.round(nextRankProgress)}%`}</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${nextRankProgress}%` }}
            style={{ backgroundColor: rankData.color, boxShadow: `0 0 8px ${rankData.color}44` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ShinobiStatusCard;
