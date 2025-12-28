
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Target, Sword, Zap, BookOpen, Moon, Plus, Trash2 } from 'lucide-react';
import { Mission } from '../types';

interface BattleGridProps {
  missions: Mission[];
  onToggle: (id: string) => void;
  onAddMission: (label: string) => void;
  onDeleteMission: (id: string) => void;
}

const getIcon = (label: string) => {
  const upper = label.toUpperCase();
  if (upper.includes('TRAINING')) return <Sword size={20} />;
  if (upper.includes('STUDY')) return <BookOpen size={20} />;
  if (upper.includes('DEEP WORK')) return <Zap size={20} />;
  if (upper.includes('NUTRITION')) return <Target size={20} />;
  return <Moon size={20} />;
};

const BattleGrid: React.FC<BattleGridProps> = ({ missions, onToggle, onAddMission, onDeleteMission }) => {
  const [newMissionLabel, setNewMissionLabel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMissionLabel.trim()) {
      onAddMission(newMissionLabel.trim());
      setNewMissionLabel('');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border-zinc-800/60 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-legendary text-2xl text-white tracking-wider italic flex items-center gap-3">
          BATTLE <span className="text-rose-600">GRID</span>
        </h2>
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] bg-zinc-900/80 px-3 py-1 rounded border border-zinc-800">
          Sync Active
        </div>
      </div>

      {/* Deployment Form (Add Mission) */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-grow group">
          <input
            type="text"
            value={newMissionLabel}
            onChange={(e) => setNewMissionLabel(e.target.value)}
            placeholder="DEPLOY NEW MISSION..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 px-4 text-xs font-legendary tracking-widest text-white placeholder:text-zinc-700 focus:outline-none focus:border-rose-600/50 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none opacity-40">
            <Plus size={14} className="text-rose-500" />
          </div>
        </div>
        <button
          type="submit"
          className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(225,29,72,0.2)] active:scale-95"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {(missions || []).map((mission, index) => (
            <motion.div
              key={mission.id}
              layout
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`
                relative group p-5 rounded-xl border transition-all duration-300 flex items-center gap-4
                ${mission.completed
                  ? 'bg-rose-950/20 border-rose-500/50 text-rose-100 shadow-[inset_0_0_20px_rgba(225,29,72,0.1)]'
                  : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40'
                }
              `}
            >
              <div
                onClick={() => onToggle(mission.id)}
                className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer
                  ${mission.completed ? 'bg-rose-600 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'}
                `}
              >
                {mission.completed ? <Check size={20} /> : getIcon(mission.label)}
              </div>

              <div className="flex flex-col flex-grow cursor-pointer" onClick={() => onToggle(mission.id)}>
                <span className={`text-[10px] font-bold tracking-widest uppercase transition-colors mb-1 ${mission.completed ? 'text-rose-500' : 'text-zinc-600'}`}>
                  Target Phase
                </span>
                <span className={`text-sm md:text-base font-legendary tracking-wide transition-colors ${mission.completed ? 'text-white' : 'text-zinc-400'}`}>
                  {mission.label}
                </span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onDeleteMission(mission.id); }}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-zinc-800"
              >
                <Trash2 size={16} />
              </button>

              {mission.completed && (
                <motion.div
                  layoutId="completed-glow"
                  className="absolute inset-0 border-2 border-rose-600/30 rounded-xl pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default BattleGrid;
