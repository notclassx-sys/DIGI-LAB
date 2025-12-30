
import React, { useState, useEffect } from 'react';
// Use namespace import and cast to any to bypass environment-specific broken react-router-dom types
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

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
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

        {user && <Chat user={user} isAdmin={isAdmin} />}

        <footer className="bg-white py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>© 2024 SNIPX DIGITAL LIBRARY. All Rights Reserved.</p>
          <p className="mt-1">Fresh Content for the Modern Reader.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;