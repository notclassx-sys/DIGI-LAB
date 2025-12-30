
import React from 'react';
import * as RRD from 'react-router-dom';
const { Link, useLocation } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { LogOut, LayoutGrid, Library, Settings, Crown } from 'lucide-react';
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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-6 pointer-events-none">
      <m.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl h-20 glass-nav rounded-[2.5rem] flex items-center justify-between px-8 luxury-shadow border border-white/40 shadow-2xl pointer-events-auto"
      >
        <Link to="/" className="flex items-center gap-4 group">
          <m.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-11 h-11 bg-slate-950 rounded-2xl flex items-center justify-center shadow-lg border border-[#d4af37]"
          >
            <span className="text-[#d4af37] font-serif font-bold text-xl italic">SA</span>
          </m.div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none mb-1">
              SNIPX <span className="text-emerald-800 font-serif italic text-2xl font-light">Archive</span>
            </span>
            <span className="text-[8px] uppercase tracking-[0.4em] text-[#d4af37] font-black leading-none">
              Elite Digital Sanctuary
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {[
            { name: 'Collection', path: '/', icon: LayoutGrid },
            ...(user ? [{ name: 'My Vault', path: '/library', icon: Library }] : []),
            ...(isAdmin ? [{ name: 'Command', path: '/admin', icon: Settings }] : [])
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-black transition-all duration-500 relative ${
                isActive(item.path) 
                ? 'text-emerald-900 bg-emerald-50' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon size={14} className={isActive(item.path) ? 'text-emerald-600' : ''} />
              {item.name}
              {isActive(item.path) && (
                <m.div 
                  layoutId="active-pill" 
                  className="absolute inset-0 bg-emerald-50 rounded-full -z-10 border border-emerald-100/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="hidden sm:block text-right">
                <p className="text-[8px] uppercase tracking-[0.2em] font-black text-[#d4af37]">Collector</p>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{user.email?.split('@')[0]}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="btn-luxury px-8 py-3.5 rounded-2xl bg-emerald-900 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:shadow-emerald-900/30 hover:-translate-y-0.5"
            >
              Verified Sign-In
            </Link>
          )}
        </div>
      </m.nav>
    </div>
  );
};

export default Navbar;
