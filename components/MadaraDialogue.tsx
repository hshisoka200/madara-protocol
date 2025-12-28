
import React, { useMemo, useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Rank } from '../types';
import { MADARA_QUOTES, DEMOTION_QUOTES } from '../constants';

interface MadaraDialogueProps {
  rank: Rank;
  userPower: number;
  madaraPower: number;
  totalDays: number;
  currentDay: number;
  streak: number;
  forcedQuote?: string | null;
}

const MADARA_RESOURCES = [
  { name: "wake_up_to_reqlity.png" },
  { name: "استفزاز.png" },
  { name: "creazy.png" },
  { name: "the_power.png" },
  { name: "رف_المستوى.png" }
];

// Helper to compare ranks
const getRankValue = (r: Rank): number => {
  if (r === 'Eternal Legend / Perfect Susanoo') return 3;
  if (r === 'Chunin / Mangekyō') return 2;
  if (r === 'Genin / 1-Tomoe') return 1;
  return 0; // Academy
};

const MadaraDialogue: React.FC<MadaraDialogueProps> = ({
  rank,
  userPower,
  madaraPower,
  totalDays,
  currentDay,
  streak,
  forcedQuote
}) => {
  const gap = madaraPower - userPower;
  const progressPercentage = (currentDay / totalDays) * 100;

  // State for Auto-Cycle Quotes (0-7): AR[0], EN[0], AR[1], EN[1]...
  const [sequenceIndex, setSequenceIndex] = useState(0);

  // State for Demotion Override
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);
  const [isGlitch, setIsGlitch] = useState(false);
  const prevRankRef = React.useRef<Rank>(rank);

  // Derived state
  const lang = sequenceIndex % 2 === 0 ? 'AR' : 'EN';
  const quoteIndex = Math.floor(sequenceIndex / 2);

  // Monitor Rank Changes for Reset & Demotion
  useEffect(() => {
    const prevRank = prevRankRef.current;

    // Check for Demotion
    if (getRankValue(rank) < getRankValue(prevRank)) {
      const demotionMsg = DEMOTION_QUOTES[rank];
      if (demotionMsg) {
        setOverrideMessage(demotionMsg);
        setIsGlitch(true);

        // Clear after 15 seconds
        const timer = setTimeout(() => {
          setOverrideMessage(null);
          setIsGlitch(false);
          setSequenceIndex(0); // Restart aligned sequence
        }, 15000);

        prevRankRef.current = rank;
        return () => clearTimeout(timer);
      }
    } else {
      // Reset sequence on any other change (like promotion)
      setSequenceIndex(0);
    }

    prevRankRef.current = rank;
  }, [rank]);

  useEffect(() => {
    // Pause timer if override is active
    if (overrideMessage) return;

    const interval = setInterval(() => {
      setSequenceIndex(prev => (prev + 1) % 8); // Cycle through 8 states (4 quotes * 2 langs)
    }, 10000);

    return () => clearInterval(interval);
  }, [overrideMessage]);

  const getCurrentMadaraAsset = () => {
    // 1. Completion / Supreme (Eternal Legend)
    if (rank === 'Eternal Legend / Perfect Susanoo') return MADARA_RESOURCES[4];

    // 2. Legendary Power (Chunin / Mangekyō)
    if (rank === 'Chunin / Mangekyō') return MADARA_RESOURCES[3];

    // 3. Streak (3+ days)
    if (streak >= 3) return MADARA_RESOURCES[2];

    // 4. Provocation (Genin)
    if (rank === 'Genin / 1-Tomoe') return MADARA_RESOURCES[1];

    // 5. Initial / Wake Up (Academy)
    return MADARA_RESOURCES[0];
  };

  const activeResource = useMemo(() => getCurrentMadaraAsset(), [rank, streak]);

  const activeQuote = useMemo(() => {
    if (overrideMessage) return overrideMessage;
    if (forcedQuote) return forcedQuote;
    return MADARA_QUOTES[rank]?.[lang]?.[quoteIndex] || "Real power is not shown, it is felt.";
  }, [rank, lang, quoteIndex, forcedQuote, overrideMessage]);

  const moodLabel = useMemo(() => {
    if (isGlitch) return 'SYSTEM FAILURE';
    if (rank === 'Eternal Legend / Perfect Susanoo') return 'Madara (Ascended)';
    if (rank === 'Chunin / Mangekyō') return 'Madara (Dominant)';
    if (streak >= 3) return 'Madara (Ecstatic)';
    if (rank === 'Genin / 1-Tomoe') return 'Madara (Focusing)';
    return 'Uchiha Madara';
  }, [rank, streak, isGlitch]);

  return (
    <motion.div
      layout
      className={`glass-card rounded-2xl p-8 border-zinc-800/60 relative overflow-hidden group min-h-[280px] flex flex-col justify-center ${isGlitch ? 'border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : ''}`}
    >
      {/* Decorative vertical bar */}
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-1000 ${isGlitch ? 'bg-red-600 animate-pulse' :
          progressPercentage >= 100 ? 'bg-rose-500 shadow-[0_0_20px_#e11d48]' :
            progressPercentage >= 80 ? 'bg-rose-600' :
              streak >= 3 ? 'bg-rose-700' : 'bg-zinc-800'
        }`} />

      <div className="mb-4 flex items-center gap-2">
        <Quote className={`text-rose-600 fill-rose-600/20 ${isGlitch ? 'animate-bounce' : ''}`} size={16} />
        <span className={`text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${isGlitch ? 'text-red-500 animate-pulse' : 'text-rose-500'}`}>
          {moodLabel}
        </span>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${activeQuote}-${lang}`} // Key change triggers animation
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.8, ease: "easeOut" }} // Subtle fade
              className={`text-lg md:text-xl font-medium leading-relaxed italic transition-colors duration-500 
                ${isGlitch ? 'text-red-400 font-mono tracking-tighter' : (progressPercentage >= 80 ? 'text-white' : 'text-zinc-300')} 
                ${(lang === 'AR' || overrideMessage) ? 'font-arabic' : ''}`}
              style={{
                direction: (lang === 'AR' || overrideMessage) ? 'rtl' : 'ltr',
                textShadow: isGlitch ? '2px 0 red, -2px 0 blue' : 'none'
              }}
            >
              "{activeQuote}"
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex-shrink-0 relative w-28 h-28 md:w-32 md:h-32 rounded-lg overflow-hidden bg-rose-950/40 animate-pulse">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeResource.name}
              src={'/assets/madara/' + encodeURIComponent(activeResource.name)}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full object-cover border-2 border-[#e11d48] rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.4)] z-10"
              alt="Madara Portrait"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  const fallbackIcon = parent.querySelector('.fallback-text');
                  if (!fallbackIcon) {
                    const text = document.createElement('div');
                    text.className = 'fallback-text absolute inset-0 flex items-center justify-center text-rose-600/20 z-0';
                    text.innerHTML = 'UCHIHA';
                    parent.appendChild(text);
                  }
                }
              }}
            />
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 flex justify-start">
        <div className={`h-[2px] rounded-full transition-all duration-1000 ${progressPercentage >= 20 ? 'bg-rose-600 w-32 shadow-[0_0_8px_#e11d48]' : 'bg-rose-900/40 w-12'
          }`} />
      </div>
    </motion.div>
  );
};

export default MadaraDialogue;
