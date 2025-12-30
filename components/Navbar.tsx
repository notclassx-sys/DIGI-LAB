
import React from 'react';
import * as RRD from 'react-router-dom';
const { Link, useLocation } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { LogOut, LayoutGrid, Library, Settings, LogIn, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const m = motion as any;

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isAdmin }) => {
  const location = useLocation();
  const handleLogout = async () => await supabase.auth.signOut();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="sticky top-0 left-0 right-0 z-50 w-full px-2 py-3 md:px-4 md:py-6 flex justify-center">
      <nav className="w-full max-w-5xl h-14 md:h-18 glass-nav rounded-2xl flex items-center justify-between px-4 md:px-8 border border-white/40 shadow-lg">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group !text-obsidian !no-underline">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-obsidian rounded-lg flex items-center justify-center border border-accent/20">
            <span className="text-accent font-serif font-bold text-sm md:text-lg italic">SA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-black tracking-tighter uppercase leading-none">
              SNIPX <span className="text-emerald-900 lowercase italic font-display text-base md:text-xl">Library</span>
            </span>
          </div>
        </Link>

        {/* Navigation - Desktop & Mobile (Clean) */}
        <div className="flex items-center gap-1 md:gap-2">
          <Link 
            to="/" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-black transition-all ${
              isActive('/') ? 'bg-obsidian text-white' : 'text-slate-400'
            }`}
          >
            <LayoutGrid size={12} />
            <span className="hidden xs:inline">Store</span>
          </Link>
          
          {user && (
            <Link 
              to="/library" 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-black transition-all ${
                isActive('/library') ? 'bg-obsidian text-white' : 'text-slate-400'
              }`}
            >
              <Library size={12} />
              <span className="hidden xs:inline">Vault</span>
            </Link>
          )}

          <div className="w-px h-4 bg-slate-200 mx-1 md:mx-2" />

          {user ? (
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 border border-slate-100"
            >
              <LogOut size={14} />
            </button>
          ) : (
            <Link 
              to="/auth" 
              className="flex items-center gap-2 px-4 py-2 bg-obsidian text-white rounded-lg font-black text-[9px] uppercase tracking-widest !no-underline"
            >
              <LogIn size={12} className="text-accent" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
