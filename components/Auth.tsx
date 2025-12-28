import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-inter">
            {/* Animated Red Chakra Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15)_0%,transparent_70%)] animate-pulse" />
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-rose-950/20 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-900/10 blur-[150px] rounded-full animate-pulse [animation-delay:1s]" />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-[450px] z-10"
            >
                <div className="glass-card border-2 border-rose-900/40 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_80px_rgba(225,29,72,0.1)] overflow-hidden">
                    {/* Header Visual */}
                    <div className="relative mb-10 flex flex-col items-center">
                        <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-rose-600 p-1 shadow-[0_0_40px_rgba(225,29,72,0.6)] overflow-hidden mb-6 group cursor-pointer relative">
                            <img
                                src="/assets/madara/wake_up_to_reqlity.png"
                                alt="Madara Uchiha"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-rose-950/40 opacity-60" />
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-legendary text-white tracking-widest uppercase mb-2">
                                MADARA <span className="text-rose-600">PROTOCOL</span>
                            </h1>
                            <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">The Uchiha Archives Await</p>
                        </motion.div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-200 text-xs italic"
                                >
                                    <AlertCircle size={16} className="text-rose-500 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600 group-focus-within:text-rose-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="EMAIL ADDRESS"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-legendary tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-rose-600 focus:ring-4 focus:ring-rose-600/5 transition-all outline-none backdrop-blur-md shadow-inner"
                                />
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600 group-focus-within:text-rose-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="PASSWORD"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-legendary tracking-widest placeholder:text-zinc-700 focus:outline-none focus:border-rose-600 focus:ring-4 focus:ring-rose-600/5 transition-all outline-none backdrop-blur-md shadow-inner"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden rounded-2xl bg-rose-600 py-5 px-6 transition-all hover:bg-rose-500 active:scale-[0.98] shadow-[0_10px_30px_rgba(225,29,72,0.3)] disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                            <div className="relative flex items-center justify-center gap-3">
                                {loading ? <Loader2 size={24} className="animate-spin text-white" /> : (
                                    <>
                                        <Shield size={20} className="text-white" />
                                        <span className="text-base font-legendary text-white tracking-[0.2em] italic uppercase">
                                            {isSignUp ? "Join the Uchiha Clan" : "Wake up to Reality"}
                                        </span>
                                    </>
                                )}
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="w-full text-center text-zinc-600 hover:text-rose-500 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors"
                        >
                            {isSignUp ? "// EXISTING SHINOBI? LOGIN" : "// NEW RECRUIT? REGISTER NOW"}
                        </button>
                    </form>

                    {/* Footer Decoration */}
                    <div className="mt-10 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="w-8 h-[1px] bg-rose-900" />
                        <Sparkles size={12} className="text-rose-500" />
                        <div className="w-8 h-[1px] bg-rose-900" />
                    </div>
                </div>
            </motion.div>

            <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 5s infinite linear;
        }
      `}</style>
        </div>
    );
};

export default Auth;
