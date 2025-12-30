
import React, { useState, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { HashRouter, Routes, Route, Navigate } = RRD as any;
import { supabase } from './supabaseClient';
import { ADMIN_EMAIL } from './constants';
import Navbar from './components/Navbar';
import Store from './pages/Store';
import Library from './pages/Library';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Chat from './components/Chat';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <m.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-obsidian rounded-3xl flex items-center justify-center border border-accent shadow-2xl"
        >
          <span className="text-accent font-serif font-bold text-2xl italic">SA</span>
        </m.div>
        <div className="w-48 h-1 bg-slate-50 rounded-full overflow-hidden">
          <m.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full bg-accent"
          />
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Store user={user} />} />
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route 
              path="/library" 
              element={user ? <Library user={user} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/admin/*" 
              element={isAdmin ? <Admin /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>

        <AnimatePresence>
          {user && <Chat user={user} isAdmin={isAdmin} />}
        </AnimatePresence>

        <footer className="py-20 border-t border-slate-50 text-center">
          <div className="max-w-7xl mx-auto px-4 space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-slate-100"></div>
              <span className="text-accent font-serif font-bold text-xl italic">SA</span>
              <div className="h-px w-12 bg-slate-100"></div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-obsidian uppercase tracking-[0.4em]">SNIPX DIGITAL LIBRARY</p>
              <p className="text-slate-400 font-medium italic text-xs tracking-wide">Elite archives for the visionary mind.</p>
            </div>
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-4">© 2024. All Protocols Reserved.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
