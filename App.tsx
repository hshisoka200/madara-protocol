
import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import MadaraLanding from './components/MadaraLanding';
import Auth from './components/Auth';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 size={48} className="text-rose-600 animate-spin" />
          <div className="absolute inset-0 bg-rose-600/20 blur-xl rounded-full" />
        </div>
        <p className="text-rose-900 font-legendary tracking-[0.5em] text-xs animate-pulse italic uppercase">
          Synthesizing Chakra...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-rose-600 selection:text-white">
      {!session ? (
        <Auth />
      ) : (
        <MadaraLanding user={session.user} />
      )}
    </div>
  );
};

export default App;
