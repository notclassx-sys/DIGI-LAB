
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
    <div className="sticky top-0 left-0 right-0 z-50 w-full px-2 py-4 md:px-4 md:py-6 flex justify-center">
      <m.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl h-16 md:h-20 glass-nav rounded-2xl md:rounded-[2.5rem] flex items-center justify-between px-4 md:px-8 border border-white/40 shadow-xl overflow-hidden"
      >
        <Link to="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
          <m.div 
            whileHover={{ scale: 1.05 }}
            className="w-9 h-9 md:w-11 md:h-11 bg-slate-950 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border border-[#d4af37] shrink-0"
          >
            <span className="text-[#d4af37] font-serif font-bold text-base md:text-xl italic">SA</span>
          </m.div>
          <div className="flex flex-col">
            <span className="text-sm md:text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1 leading-none mb-0.5 md:mb-1">
              SNIPX <span className="text-emerald-800 font-serif italic text-base md:text-2xl font-light">Library</span>
            </span>
            <span className="hidden xs:block text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-[#d4af37] font-black leading-none">
              Elite Sanctuary
            </span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-1 md:gap-2">
          {[
            { name: 'Books', path: '/', icon: LayoutGrid },
            ...(user ? [{ name: 'My Vault', path: '/library', icon: Library }] : []),
            ...(isAdmin ? [{ name: 'Command', path: '/admin', icon: Settings }] : [])
          ].map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-black transition-all duration-300 relative ${
                isActive(item.path) 
                ? 'text-emerald-900 bg-emerald-50' 
                : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <item.icon size={12} className={isActive(item.path) ? 'text-emerald-600' : ''} />
              <span className="hidden md:inline">{item.name}</span>
              {isActive(item.path) && (
                <m.div 
                  layoutId="active-pill" 
                  className="absolute inset-0 bg-emerald-50 rounded-full -z-10 border border-emerald-100/50"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-100">
              <div className="hidden md:block text-right">
                <p className="text-[7px] uppercase tracking-widest font-black text-[#d4af37]">Collector</p>
                <p className="text-[10px] font-bold text-slate-900 truncate max-w-[80px]">{user.email?.split('@')[0]}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="btn-luxury px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-2xl bg-emerald-900 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              Login
            </Link>
          )}
        </div>
      </m.nav>
    </div>
  );
};

export default Navbar;
