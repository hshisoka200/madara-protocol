
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Flame, Scroll, Zap, Target, Settings2, Plus, X } from 'lucide-react';
import { Rank, Mission } from '../types';
import { RANK_THRESHOLDS, INITIAL_MISSIONS, MADARA_QUOTES } from '../constants';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import MadaraDialogue from './MadaraDialogue';
import BattleGrid from './BattleGrid';
import RankBadge from './RankBadge';
import TacticalAnalysis from './TacticalAnalysis';
import ShinobiStatusCard from './ShinobiStatusCard';
import PunishmentModal from './PunishmentModal';

interface MadaraLandingProps {
  user: User;
}

const MadaraLanding: React.FC<MadaraLandingProps> = ({ user }) => {
  const [currentDay, setCurrentDay] = useState(1);
  const [completedDays, setCompletedDays] = useState(0);
  const [totalDays, setTotalDays] = useState(15);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [history, setHistory] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [madaraPower, setMadaraPower] = useState(95);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [punishmentModalOpen, setPunishmentModalOpen] = useState(false);
  const [penaltyType, setPenaltyType] = useState<'reset' | 'heavy' | 'light'>('light');
  const [daysLost, setDaysLost] = useState(0);
  const [lastSealedAt, setLastSealedAt] = useState<string | null>(null);
  const [timeToNextSeal, setTimeToNextSeal] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [timeToWindow, setTimeToWindow] = useState<string | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [modalStep, setModalStep] = useState<'selection' | 'input'>('selection');
  const [customExtensionDays, setCustomExtensionDays] = useState('15');
  const [customDays, setCustomDays] = useState('');
  const [forcedQuote, setForcedQuote] = useState<string | null>(null);
  const [hasSelectedInSession, setHasSelectedInSession] = useState(false);

  // Trigger Completion Modal when plan is finished
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?.id) return;

      console.log("Fetching mission data from the Uchiha Archives...");
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        console.log("Loaded data from DB:", data);
        setTotalDays(data.total_days || 15);
        setCompletedDays(data.completed_days || 0);
        setRetryCount(data.retry_count || 0);
        setLastSealedAt(data.last_sealed_at || null);
        setHistory(data.chart_history || []);
        setMissions(data.missions || INITIAL_MISSIONS);
        // currentDay is calculated based on the loaded completedDays
        setCurrentDay(Math.min((data.completed_days || 0) + 1, data.total_days || 15));
      } else if (error && error.code === 'PGRST116') {
        console.log("No record found. Initiating first chronicle...");
        await supabase.from('user_progress').upsert({
          user_id: user.id,
          total_days: 0,
          history: [],
          missions: INITIAL_MISSIONS,
          completed_days: 0,
          retry_count: 0,
          last_sealed_at: null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      }
      setLoading(false);
    };

    fetchPlan();
  }, [user.id]);

  // Sync state to Supabase when totalDays, history, completedDays, or missions changes
  useEffect(() => {
    const syncPlan = async () => {
      if (loading) return; // Prevent syncing before initial data is loaded
      if (user) {
        const { error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            total_days: totalDays,
            chart_history: history,
            completed_days: completedDays,
            missions: missions,
            retry_count: retryCount,
            last_sealed_at: lastSealedAt,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (!error) {
          console.log("Data successfully synced with Madara's DB", { completed_days: completedDays, total_days: totalDays });
        }
      }
    };
    syncPlan();
  }, [totalDays, history, completedDays, missions, retryCount, lastSealedAt, user?.id, loading]);

  // Auto-Failure Check & Cooldown Timer
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const currentUTCHour = now.getUTCHours();
      const last = lastSealedAt ? new Date(lastSealedAt).getTime() : 0;
      const nowMs = now.getTime();

      // UTC Window Logic (20:00 - 00:00 UTC)
      // Open if hour is 20, 21, 22, 23
      const isOpen = currentUTCHour >= 20 && currentUTCHour < 24;
      setIsWindowOpen(isOpen);

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (!isOpen) {
        // Calculate time until next window (20:00 UTC)
        const nextWindow = new Date();
        nextWindow.setUTCHours(20, 0, 0, 0);
        let diffWindow = nextWindow.getTime() - nowMs;

        // If we are past 00:00 but before 20:00, diff is positive.
        // If it's 23:59 (isOpen would be true), we don't reach here.
        if (diffWindow < 0) {
          // Should not happen with < 20 check
        }

        const h = Math.floor(diffWindow / (1000 * 60 * 60));
        const m = Math.floor((diffWindow % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffWindow % (1000 * 60)) / 1000);
        setTimeToWindow(`${pad(h)}:${pad(m)}:${pad(s)}`);
      } else {
        // Calculate time until gate closes (00:00 UTC tomorrow)
        const closeWindow = new Date();
        closeWindow.setUTCHours(24, 0, 0, 0);
        let diffClose = closeWindow.getTime() - nowMs;

        const h = Math.floor(diffClose / (1000 * 60 * 60));
        const m = Math.floor((diffClose % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffClose % (1000 * 60)) / 1000);
        setTimeToWindow(`${pad(h)}:${pad(m)}:${pad(s)}`);
      }

      if (!lastSealedAt) {
        setTimeToNextSeal(null);
        setIsTimerActive(false);
        return;
      }
      const hoursSinceLast = (nowMs - last) / (1000 * 60 * 60);

      // 1. Auto-Failure Check (> 48h implies missed 24h window)
      if (hoursSinceLast >= 48) {
        // Trigger punishment logic for auto-failure
        console.log("Auto-failure detected: more than 48 hours since last seal.");

        const newRetryCount = retryCount + 1;
        let finalRetryCount = newRetryCount;
        let penalty: 'reset' | 'heavy' | 'light' = 'light';
        let lostDays = 0;
        let nextCompletedDays = completedDays;

        if (newRetryCount >= 5) {
          penalty = 'reset';
          nextCompletedDays = 0;
          lostDays = completedDays;
          finalRetryCount = 0;
        } else if (completedDays >= 16) {
          penalty = 'heavy';
          lostDays = 7;
          nextCompletedDays = Math.max(0, completedDays - 7);
        } else {
          penalty = 'light';
          lostDays = 3;
          nextCompletedDays = Math.max(0, completedDays - 3);
        }

        setRetryCount(finalRetryCount);
        setPenaltyType(penalty);
        setDaysLost(lostDays);
        setCompletedDays(nextCompletedDays);
        setCurrentDay(Math.min(nextCompletedDays + 1, totalDays));
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPunishmentModalOpen(true);

        const newHistory = history.slice(0, Math.max(0, history.length - lostDays));
        const punishmentHistory = [...newHistory, 0];
        setHistory(punishmentHistory);

        if (user?.id) {
          supabase
            .from('user_progress')
            .update({
              completed_days: nextCompletedDays,
              chart_history: punishmentHistory,
              retry_count: finalRetryCount,
              last_sealed_at: new Date().toISOString(), // Update last sealed to now to reset timer
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.error("Auto-Punishment Sync Failed:", error);
            });
        }
        // After auto-punishment, we should reset lastSealedAt to now to prevent immediate re-trigger
        setLastSealedAt(new Date().toISOString());
        return; // Exit to prevent cooldown calculation on a failed state
      }

      // 2. Cooldown Timer
      const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours
      const nextSealTime = last + cooldownMs;
      const diff = nextSealTime - nowMs;

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeToNextSeal(`${pad(h)}:${pad(m)}:${pad(s)}`);
        setIsTimerActive(true);
      } else {
        setTimeToNextSeal(null);
        setIsTimerActive(false);
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 1000); // Check every second
    return () => clearInterval(timer);
  }, [lastSealedAt, completedDays, retryCount, history, totalDays, user?.id]); // Added dependencies for punishment logic

  useEffect(() => {
    if (completedDays >= totalDays && totalDays > 0 && !showExtensionModal) {
      console.log("Plan Target Reached - Triggering Madara");
      setShowExtensionModal(true);
      setModalStep('selection');
    }
  }, [completedDays, totalDays, showExtensionModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMadaraPower(prev => {
        const change = (Math.random() - 0.5) * 4;
        const newVal = Math.max(80, Math.min(100, prev + change));
        return newVal;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const progress = useMemo(() => {
    if (!totalDays || totalDays <= 0) return 0;
    return Math.min(100, (completedDays / totalDays) * 100);
  }, [completedDays, totalDays]);
  const userProgressRate = history.length > 0 ? history[history.length - 1] : 0;

  // Streak calculation: count consecutive 100% days from the end of history
  const streak = useMemo(() => {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] >= 100) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [history]);

  const auraIntensity = useMemo(() => {
    if (progress <= 40) return 0;
    return (progress - 40) / 60;
  }, [progress]);

  const currentRank = useMemo((): Rank => {
    // Current Rank based on Net Completed Days (allows for punishment demotion)
    const activeDays = completedDays;
    if (activeDays <= RANK_THRESHOLDS.ACADEMY) return 'Academy Student';
    if (activeDays <= RANK_THRESHOLDS.GENIN) return 'Genin / 1-Tomoe';
    if (activeDays <= RANK_THRESHOLDS.CHUNIN) return 'Chunin / Mangekyō';
    return 'Eternal Legend / Perfect Susanoo';
  }, [completedDays]);

  const handleTaskToggle = (id: string) => {
    setMissions(prev => (prev || []).map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const addMission = (label: string) => {
    const newMission: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      label: label.toUpperCase(),
      completed: false
    };
    setMissions(prev => [...(prev || []), newMission]);
  };

  const deleteMission = (id: string) => {
    setMissions(prev => (prev || []).filter(m => m.id !== id));
  };

  const handleSealDay = async () => {
    // 0. Block if Window Closed
    if (!isWindowOpen) {
      setForcedQuote("الوقت لم يحن بعد.. لا تستعجل نهايتك، انتظر حتى تفتح بوابة الختم العالمية.");
      setIsShaking(true);
      setTimeout(() => {
        setForcedQuote(null);
        setIsShaking(false);
      }, 5000);
      return;
    }

    // Prevent sealing if cooldown is active
    if (timeToNextSeal) {
      console.log("Cannot seal day: Cooldown active.");
      return;
    }

    const completedCount = (missions || []).filter(m => m.completed).length;
    const completionRate = (missions || []).length > 0 ? (completedCount / missions.length) * 100 : 0;

    // If already finished, trigger modal instead of sealing
    if (completedDays >= totalDays) {
      setShowExtensionModal(true);
      setModalStep('selection');
      return;
    }

    // PUNISHMENT LOGIC: 0 Missions Completed
    if (completedCount === 0) {
      const newRetryCount = retryCount + 1;
      let finalRetryCount = newRetryCount; // Placeholder for final sync value
      let penalty: 'reset' | 'heavy' | 'light' = 'light';
      let lostDays = 0;
      let nextCompletedDays = completedDays;

      if (newRetryCount >= 5) {
        // CASE 1: TOTAL FAILURE - RESET EVERYTHING
        penalty = 'reset';
        nextCompletedDays = 0;
        lostDays = completedDays;
        // Reset retry count after 5 failures as requested
        finalRetryCount = 0;
      } else if (completedDays >= 16) {
        // CASE 2: ADVANCED PENALTY
        penalty = 'heavy';
        lostDays = 7;
        nextCompletedDays = Math.max(0, completedDays - 7);
      } else {
        // CASE 3: BEGINNER PENALTY (Default)
        penalty = 'light';
        lostDays = 3;
        nextCompletedDays = Math.max(0, completedDays - 3);
      }

      setRetryCount(finalRetryCount);
      setPenaltyType(penalty);
      setDaysLost(lostDays);
      setCompletedDays(nextCompletedDays);
      setCurrentDay(Math.min(nextCompletedDays + 1, totalDays)); // Recalculate current day based on new progress
      setIsShaking(true); // Visual Feedback
      setTimeout(() => setIsShaking(false), 500);
      setPunishmentModalOpen(true);

      // Sync punishment immediately
      // LOGIC: Remove the days we just lost from the chart history to visually "retreat"
      const newHistory = history.slice(0, Math.max(0, history.length - lostDays));
      const punishmentHistory = [...newHistory, 0]; // Append 0 to show the crash of the current attempt
      setHistory(punishmentHistory);

      const nowISO = new Date().toISOString();
      setLastSealedAt(nowISO); // Set last sealed at for cooldown

      if (user?.id) {
        supabase
          .from('user_progress')
          .update({
            completed_days: nextCompletedDays,
            chart_history: punishmentHistory,
            retry_count: finalRetryCount,
            last_sealed_at: nowISO,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error("Punishment Sync Failed:", error);
          });
      }
      return;
    }

    // SUCCESS LOGIC (>0 Missions)
    setIsShaking(true);
    setShowFlash(true);

    const nextCompletedDays = Math.min(completedDays + 1, totalDays);
    const newHistory = [...history, completionRate]; // Track DAILY PERCENTAGE
    const newMissions = missions.map(m => ({ ...m, completed: false }));
    const nowISO = new Date().toISOString();
    setLastSealedAt(nowISO);

    // Reset retry count on success
    const nextRetryCount = 0;
    setRetryCount(nextRetryCount);

    setTimeout(async () => {
      setIsShaking(false);
      setShowFlash(false);

      setHistory(newHistory);
      setCompletedDays(nextCompletedDays);
      setCurrentDay(Math.min(nextCompletedDays + 1, totalDays));
      setMissions(newMissions);
      setMadaraPower(p => Math.min(100, p + 2));
      setForcedQuote(null);

      // Explicit Sync for Seal the Day
      if (user?.id) {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: user.id,
            total_days: totalDays,
            chart_history: newHistory,
            completed_days: nextCompletedDays,
            missions: newMissions,
            retry_count: nextRetryCount,
            last_sealed_at: nowISO,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        console.log("Data successfully synced with Madara's DB", { completed_days: nextCompletedDays });

        // Explicit explicit last_sealed_at update as requested to ensure redundancy
        await supabase.from('user_progress').update({ last_sealed_at: nowISO }).eq('user_id', user.id);
      }
    }, 400);
  };

  const extendPlan = (daysToAdd: number) => {
    setTotalDays(prev => prev + daysToAdd);
    setShowExtensionModal(false);
  };

  const handlePlanChange = (newDays: number) => {
    if (currentDay > 1) {
      if (!window.confirm("Changing the plan will recalibrate the Uchiha archives. Proceed?")) {
        return;
      }
    }

    if (newDays >= 365) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 1000);
    }

    setTotalDays(newDays);
    setHasSelectedInSession(true);
    setForcedQuote(null);

    if (currentDay > newDays) {
      setCurrentDay(newDays);
      setHistory(prev => prev.slice(0, newDays));
    }
    setIsPlanModalOpen(false);
  };

  const handleOpenPlanModal = () => {
    setHasSelectedInSession(false);
    setIsPlanModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!hasSelectedInSession) {
      setForcedQuote("Indecision is the first step toward defeat.");
    }
    setIsPlanModalOpen(false);
  };

  const auraStyle = {
    boxShadow: auraIntensity > 0
      ? `0 0 ${auraIntensity * 40}px rgba(59, 130, 246, ${auraIntensity * 0.4}), inset 0 0 ${auraIntensity * 20}px rgba(59, 130, 246, ${auraIntensity * 0.1})`
      : 'none',
    borderColor: auraIntensity > 0
      ? `rgba(59, 130, 246, ${auraIntensity * 0.5})`
      : 'rgba(39, 39, 42, 0.8)'
  };

  return (
    <motion.div
      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.1, repeat: 2 }}
      className="relative min-h-screen p-4 md:p-8 lg:p-12 flex flex-col items-center max-w-7xl mx-auto overflow-hidden"
    >
      {!user && (
        <div className="fixed top-0 left-0 w-full bg-rose-600 text-white py-2 text-center text-xs font-bold uppercase tracking-widest z-[100000] shadow-lg">
          Your progress is not being saved. Wake up and login to reality.
        </div>
      )}
      {/* PERSISTENT TOP-RIGHT DAY COUNTER */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-full pl-6 pr-2 py-2 shadow-2xl">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Chronicles</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-legendary text-rose-600 shadow-rose-600/20">{currentDay}</span>
            <span className="text-xs text-zinc-600">/ {totalDays}</span>
          </div>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
            <circle cx={24} cy={24} r={20} stroke="currentColor" strokeWidth={2} fill="transparent" className="text-zinc-900" />
            <motion.circle
              cx={24} cy={24} r={20} stroke="currentColor" strokeWidth={2} fill="transparent"
              className="text-rose-600"
              strokeDasharray="125.66"
              initial={{ strokeDashoffset: 125.66 }}
              animate={{ strokeDashoffset: 125.66 * (1 - (Number(progress) || 0) / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-zinc-400">
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-950/30 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-rose-600 z-[1000] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div className="flex flex-col">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 text-rose-500 mb-1"
          >
            <Shield size={16} />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase">Uchiha Clan Network</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-legendary leading-none tracking-tighter text-white">
            PROTOCOL <span className="text-rose-600">ACTIVE</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-mono text-sm tracking-widest uppercase">
            // STATUS: {madaraPower > 99 ? <span className="text-rose-600 animate-pulse">SUPREME REACHED</span> : 'MONITORING CHAKRA LEVELS'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/50 p-1 pr-6 rounded-full border border-zinc-800 glass-card">
          <div className="bg-rose-600 p-3 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.4)]">
            <Zap size={24} className="text-white fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Madara Power</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-legendary text-white">{madaraPower.toFixed(1)}%</span>
              {madaraPower >= 100 && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-2 h-2 rounded-full bg-rose-600 shadow-[0_0_8px_#e11d48]" />}
            </div>
          </div>
          <div className="ml-4 h-8 w-[1px] bg-zinc-800" />
          <RankBadge rank={currentRank} progress={progress} />

          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-4 p-2 text-zinc-600 hover:text-white transition-colors group relative"
            title="Leave the Dream"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-rose-900 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Leave the Dream
            </span>
          </button>
        </div>
      </header>

      {/* PLAN BUTTON */}
      <div className="w-full mb-8 relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
        <button
          onClick={handleOpenPlanModal}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest hover:border-rose-600/50 shadow-lg group"
        >
          <Settings2 size={16} className="group-hover:rotate-90 transition-transform duration-500" />
          ACTIVE PLAN: {totalDays} DAYS
        </button>
      </div>

      {/* MODAL SYSTEM */}
      <AnimatePresence>
        {isPlanModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card border-2 border-rose-600 rounded-3xl p-8 shadow-[0_0_50px_rgba(225,29,72,0.2)] overflow-hidden"
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-legendary text-white mb-2">RECALIBRATE <span className="text-rose-600">ARCHIVES</span></h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">Select a discipline duration to alter the Uchiha timeline.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[7, 30, 60, 365].map(d => (
                  <button
                    key={d}
                    onClick={() => handlePlanChange(d)}
                    className={`relative overflow-hidden py-4 rounded-xl border-2 transition-all group ${totalDays === d ? 'border-rose-600 bg-rose-600/10 text-white' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200'}`}
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-2xl font-legendary">{d}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Days</span>
                    </div>
                    {totalDays === d && (
                      <motion.div layoutId="modal-active" className="absolute inset-0 bg-rose-600/5 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Custom Duration</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="ENTER DAYS..."
                    className="flex-grow bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm font-legendary tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-rose-600 transition-colors"
                  />
                  <button
                    onClick={() => handlePlanChange(parseInt(customDays) || totalDays)}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-6 rounded-xl flex items-center justify-center transition-colors shadow-lg active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showExtensionModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {modalStep === 'selection' ? (
                <motion.div
                  key="selection"
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                  className="relative w-full max-w-2xl glass-card border-2 border-[#e11d48] rounded-[2rem] p-10 shadow-[0_0_80px_rgba(225,29,72,0.4)] overflow-hidden flex flex-col items-center text-center"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-600 to-transparent" />

                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-[#e11d48] shadow-[0_0_30px_rgba(225,29,72,0.6)] mb-8 relative">
                    <img
                      src="/assets/madara/استفزاز.png"
                      className="w-full h-full object-cover"
                      alt="Madara Provocation"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  <h2 className="text-4xl md:text-5xl font-legendary text-white mb-6 tracking-tighter uppercase italic">
                    LEGACY <span className="text-[#e11d48]">REACHED</span>
                  </h2>

                  <p className="text-zinc-300 text-lg md:text-xl font-medium leading-relaxed italic max-w-xl mb-10 leading-relaxed">
                    "You have completed {totalDays} days of survival... but is this truly your limit? Only those who extend their decree can claim true power."
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <button
                      onClick={() => extendPlan(totalDays)}
                      className="group relative px-6 py-4 bg-zinc-900/80 border border-zinc-800 rounded-xl transition-all hover:border-rose-600 hover:bg-rose-950/20"
                    >
                      <span className="text-xs font-bold text-zinc-500 group-hover:text-rose-400 block mb-1">EXTEND LEGACY</span>
                      <span className="text-lg font-legendary text-white uppercase tracking-wider">+{totalDays} Days</span>
                    </button>

                    <button
                      onClick={() => extendPlan(30)}
                      className="group relative px-6 py-4 bg-rose-600 border border-rose-500 rounded-xl transition-all hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.3)] animate-pulse hover:animate-none scale-105"
                    >
                      <span className="text-xs font-bold text-rose-200 block mb-1">LEGENDARY</span>
                      <span className="text-lg font-legendary text-white uppercase tracking-wider">+30 Days</span>
                    </button>

                    <button
                      onClick={() => setModalStep('input')}
                      className="group relative px-6 py-4 bg-zinc-900/80 border border-zinc-800 rounded-xl transition-all hover:border-zinc-500"
                    >
                      <span className="text-xs font-bold text-zinc-500 block mb-1">CUSTOM</span>
                      <span className="text-lg font-legendary text-white uppercase tracking-wider">DECREE</span>
                    </button>
                  </div>

                  <div className="mt-10 pt-6 border-t border-zinc-800/50 w-full flex justify-center gap-4">
                    <span className="text-[10px] font-bold text-rose-900 uppercase tracking-[0.5em]">Eternal Discipline</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 50, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -50, filter: 'blur(20px)' }}
                  className="relative w-full max-w-xl glass-card border-2 border-rose-900/40 rounded-[2rem] p-10 shadow-[0_0_100px_rgba(225,29,72,0.2)] overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-600 to-transparent opacity-50" />

                  <div className="mb-10 text-center">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.5em] mb-8">Extend Your Destiny</p>

                    <div className="min-h-[140px] flex items-center justify-center mb-8 px-6 bg-zinc-950/40 rounded-3xl border border-zinc-900 shadow-inner">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={customExtensionDays}
                          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                          className={`text-xl md:text-2xl font-bold italic tracking-wide lowercase text-center leading-normal transition-all duration-300 ${parseInt(customExtensionDays) <= 10 ? 'text-zinc-600' :
                            parseInt(customExtensionDays) <= 29 ? 'text-rose-900' :
                              parseInt(customExtensionDays) <= 60 ? 'text-rose-600 drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]' :
                                'text-rose-500 drop-shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
                            }`}
                        >
                          "{
                            parseInt(customExtensionDays) <= 10 ? "is this all you can offer? mere days? you aren't even worth the effort of my gaze." :
                              parseInt(customExtensionDays) <= 29 ? "a pathetic attempt to cling to life. you are simply delaying the inevitable." :
                                parseInt(customExtensionDays) <= 60 ? "you pique my interest... perhaps there is a flicker of the will of fire in you. but can you truly endure?" :
                                  "a blatant challenge! do you dare to write your destiny so boldly? then show me how you face the abyss of discipline!"
                          }"
                        </motion.p>
                      </AnimatePresence>
                    </div>

                    <div className="relative group max-w-[280px] mx-auto">
                      <input
                        type="number"
                        autoFocus
                        value={customExtensionDays}
                        onChange={(e) => setCustomExtensionDays(e.target.value)}
                        placeholder="00"
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-6 px-2 text-6xl font-legendary text-center text-white focus:outline-none focus:border-rose-600 transition-all outline-none"
                      />
                      <div className="absolute -bottom-[2px] left-0 w-full h-[2px] bg-rose-600 origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 shadow-[0_0_15px_#e11d48]" />
                      <div className="mt-2 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Days to Annex</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setModalStep('selection')}
                      className="px-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      Return to the Dream
                    </button>
                    <button
                      onClick={() => extendPlan(parseInt(customExtensionDays) || 0)}
                      className="px-6 py-4 bg-rose-600 border border-rose-500 rounded-xl text-white hover:bg-rose-500 transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(225,29,72,0.3)]"
                    >
                      Seal Fate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      <motion.main
        animate={{
          boxShadow: auraIntensity === 1
            ? [auraStyle.boxShadow, auraStyle.boxShadow.replace('0.4', '0.6'), auraStyle.boxShadow]
            : auraStyle.boxShadow,
          borderColor: auraStyle.borderColor
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-grow bg-[#0c0c0c]/80 backdrop-blur-md rounded-3xl p-6 md:p-10 border transition-all duration-1000"
      >
        <div className="lg:col-span-4 flex flex-col gap-6">
          <MadaraDialogue
            rank={currentRank}
            userPower={userProgressRate}
            madaraPower={madaraPower}
            totalDays={totalDays}
            currentDay={currentDay}
            streak={streak}
            forcedQuote={forcedQuote}
          />

          <TacticalAnalysis history={history} currentDay={currentDay} madaraPower={madaraPower} totalDays={totalDays} />

          <div className="glass-card rounded-2xl p-6 border-zinc-800/60 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Scroll size={80} className="text-rose-500" />
            </div>
            <h3 className="font-legendary text-xl mb-4 text-zinc-300">SYSTEM STATS</h3>
            <div className="space-y-4">
              <StatItem label="Protocol Completion" value={`${Math.round(progress)}%`} color="bg-rose-600" />
              <StatItem label="Chakra Density" value={`${(currentDay * (100 / totalDays)).toFixed(1)}%`} color="bg-zinc-600" />
              <StatItem label="Visual Prowess" value={currentRank === 'Eternal Legend / Perfect Susanoo' ? 'Eternal' : 'Developing'} color="bg-zinc-800" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <ShinobiStatusCard lifetimeDays={completedDays} />

          <BattleGrid
            missions={missions}
            onToggle={handleTaskToggle}
            onAddMission={addMission}
            onDeleteMission={deleteMission}
          />

          <div className="mt-auto pt-6">
            {/* Real-time Gate Countdown Viewer */}
            <div className="text-center mb-6">
              {timeToNextSeal ? (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-mono text-rose-500 animate-pulse tracking-[0.3em] mb-2 uppercase">Chakra Dormant</span>
                  <span className="text-3xl font-mono text-rose-600 drop-shadow-[0_0_10px_#e11d48] tabular-nums">
                    {timeToNextSeal}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center px-6 py-4 bg-zinc-950/40 rounded-3xl border border-zinc-900/50 shadow-inner group">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 transition-colors duration-500 ${isWindowOpen ? 'text-rose-500' : 'text-amber-500'}`}>
                    {isWindowOpen ? 'ستغلق البوابة خلال:' : 'تفتح بوابة الختم بعد:'}
                  </span>
                  <div className="relative">
                    <span className={`text-4xl md:text-5xl font-mono tracking-wider tabular-nums transition-all duration-500 ${isWindowOpen ? 'text-rose-600 drop-shadow-[0_0_15px_#e11d48]' : 'text-amber-600 drop-shadow-[0_0_15px_#d97706]'}`}>
                      {timeToWindow}
                    </span>
                    <div className={`absolute -inset-2 blur-xl opacity-20 rounded-full transition-colors duration-500 ${isWindowOpen ? 'bg-rose-600' : 'bg-amber-600'}`} />
                  </div>
                  {isWindowOpen && (
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-[10px] text-zinc-500 mt-3 uppercase tracking-widest font-legendary italic bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 via-rose-500 to-zinc-500"
                    >
                      أختم يومك الآن!
                    </motion.span>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSealDay}
              disabled={!!timeToNextSeal} // Clickable if window is closed to show Madara's message
              className={`group relative w-full overflow-hidden rounded-2xl py-8 px-12 transition-all active:scale-[0.98] ${timeToNextSeal
                ? 'bg-zinc-900 border border-zinc-800 cursor-not-allowed opacity-70'
                : (isWindowOpen ? 'bg-rose-600 hover:bg-rose-500' : 'bg-red-900/20 border border-red-900/50 hover:bg-red-900/30 cursor-pointer')
                }`}
            >
              {!timeToNextSeal && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
              <div className="relative flex items-center justify-center gap-4">
                {timeToNextSeal ? <Shield size={32} className="text-zinc-600" /> : (
                  !isWindowOpen ? <Shield size={32} className="text-amber-700" /> : <Flame className="text-white fill-current group-hover:animate-pulse" size={32} />
                )}
                <span className={`text-3xl md:text-4xl font-legendary tracking-widest italic ${timeToNextSeal ? 'text-zinc-600' : (!isWindowOpen ? 'text-amber-700' : 'text-white')}`}>
                  {timeToNextSeal ? 'CHAKRA RECOVERING' : (!isWindowOpen ? 'GATE CLOSED' : 'SEAL THE DAY')}
                </span>
                {timeToNextSeal ? <Shield size={32} className="text-zinc-600" /> : (
                  !isWindowOpen ? <Shield size={32} className="text-amber-700" /> : <Flame className="text-white fill-current group-hover:animate-pulse" size={32} />
                )}
              </div>

              {!timeToNextSeal && <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />}
            </button>
            <p className="text-center text-zinc-600 text-[10px] mt-4 uppercase tracking-[0.3em] font-bold">
              CAUTION: SEALING IS PERMANENT. COMMIT YOUR CHAKRA.
            </p>
          </div>
        </div>

        <PunishmentModal
          isOpen={punishmentModalOpen}
          onClose={() => setPunishmentModalOpen(false)}
          penaltyType={penaltyType}
          daysLost={daysLost}
          retryCount={retryCount}
        />
      </motion.main>

      <footer className="w-full mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-xs gap-4 relative z-10">
        <div className="flex items-center gap-4 uppercase font-bold tracking-widest">
          <span className="text-rose-800">01. Strength</span>
          <span className="text-rose-800">02. Vision</span>
          <span className="text-rose-800">03. Legacy</span>
        </div>
        <div className="font-mono">
          &copy; UC-GLOBAL / MADARA_PROTOCOL_v4.0.0
        </div>
      </footer>
    </motion.div >
  );
};

const StatItem: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: value }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

export default MadaraLanding;
