
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface PunishmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    penaltyType: 'reset' | 'heavy' | 'light';
    daysLost: number;
    retryCount: number;
}

const PUNISHMENT_CONFIG = {
    reset: {
        title: "TOTAL DISGRACE",
        message: "Five attempts. Zero progress. You have proven yourself unworthy of the Uchiha legacy. The archives have been burned.",
        videoId: "695806211210682732", // Reset
        color: "bg-red-950",
        borderColor: "border-red-600"
    },
    heavy: {
        title: "MAJOR REGRESSION",
        message: "You are not a child anymore. To fail at this level is a choice. Pay the price in blood and time.",
        videoId: "220465344253385292", // 7-day penalty
        color: "bg-orange-950",
        borderColor: "border-orange-600"
    },
    light: {
        title: "WEAKNESS DETECTED",
        message: "Even an Academy Student knows better. Do not let this become a habit, or the consequences will escalate.",
        videoId: "147070744074276270", // 3-day penalty
        color: "bg-yellow-950",
        borderColor: "border-yellow-600"
    }
};

const PunishmentModal: React.FC<PunishmentModalProps> = ({ isOpen, onClose, penaltyType, daysLost, retryCount }) => {
    if (!isOpen) return null;

    const config = PUNISHMENT_CONFIG[penaltyType];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`relative w-full max-w-4xl bg-black border-2 ${config.borderColor} rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)] flex flex-col md:flex-row`}
                >
                    {/* Video Section */}
                    <div className="w-full md:w-1/2 relative bg-black aspect-video md:aspect-auto">
                        <iframe
                            src={`https://assets.pinterest.com/ext/embed.html?id=${config.videoId}`}
                            height="100%"
                            width="100%"
                            frameBorder="0"
                            scrolling="no"
                            className="absolute inset-0 w-full h-full object-cover"
                        ></iframe>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Content Section */}
                    <div className={`w-full md:w-1/2 p-8 flex flex-col justify-center ${config.color}`}>
                        <div className="flex items-center gap-3 mb-4 text-red-500">
                            <AlertTriangle size={24} className="animate-pulse" />
                            <span className="font-legendary text-xl tracking-widest uppercase">MADARA'S JUDGMENT</span>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">{config.title}</h2>

                        <div className="text-4xl font-black text-white/10 mb-6 font-legendary">
                            {penaltyType === 'reset' ? 'ZERO' : `-${daysLost} DAYS`}
                        </div>

                        <p className="text-zinc-300 text-lg leading-relaxed italic mb-8 border-l-2 border-white/20 pl-4">
                            "{config.message}"
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            ACCEPT PUNISHMENT
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PunishmentModal;
