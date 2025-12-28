
import React from 'react';
import { motion } from 'framer-motion';
import { Rank } from '../types';

interface RankBadgeProps {
  rank: Rank;
  progress: number;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  const isLegend = rank === 'Eternal Legend / Perfect Susanoo';
  const isAcademy = rank === 'Academy Student';

  const getRankStyles = () => {
    switch (rank) {
      case 'Academy Student':
        return 'text-zinc-500 border-zinc-700 bg-zinc-900/80 shadow-none';
      case 'Genin / 1-Tomoe':
        return 'text-white border-zinc-200 bg-zinc-800/80 shadow-[0_0_10px_rgba(255,255,255,0.1)]';
      case 'Chunin / Mangekyō':
        return 'text-rose-400 border-rose-500/50 bg-rose-950/20 shadow-[0_0_15px_rgba(225,29,72,0.2)]';
      case 'Eternal Legend / Perfect Susanoo':
        return 'text-rose-100 border-rose-600 bg-rose-600/20 shadow-[0_0_30px_rgba(225,29,72,0.6)] animate-pulse';
    }
  };

  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Combat Rank</span>
      <motion.div
        key={rank}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          px-4 py-1.5 rounded-lg border text-sm font-legendary italic tracking-widest uppercase transition-all duration-700
          ${getRankStyles()}
        `}
        style={isLegend ? { textShadow: '0 0 10px rgba(225,29,72,0.8)' } : {}}
      >
        {rank}
      </motion.div>
    </div>
  );
};

export default RankBadge;
