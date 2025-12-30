
import React from 'react';
// Use namespace import and cast to any to bypass broken react-router-dom types
import * as RRD from 'react-router-dom';
const { Link, useLocation } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { LogOut, Library, LayoutDashboard, Store, User as UserIcon, BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';

// Cast motion to any to bypass broken property types in the current environment
const m = motion as any;

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, isAdmin }) => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <m.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-green-500 overflow-hidden"
          >
             {/* Using a high-quality icon as a logo placeholder that fits the luxury/professional vibe */}
             <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl italic relative z-10">SA</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-green-600/30 to-transparent"></div>
             </div>
          </m.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              SNIPX <span className="text-green-600 font-serif italic text-2xl ml-0.5">Library</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold leading-none">
              The Digital Sanctuary
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-all duration-300 relative py-2 ${isActive('/') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
          >
            Store
            {isActive('/') && <m.div layoutId="navline" className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full" />}
          </Link>
          
          {user && (
            <Link 
              to="/library" 
              className={`text-sm font-semibold transition-all duration-300 relative py-2 ${isActive('/library') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
            >
              My Library
              {isActive('/library') && <m.div layoutId="navline" className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full" />}
            </Link>
          )}

          {isAdmin && (
            <Link 
              to="/admin" 
              className={`text-sm font-semibold transition-all duration-300 relative py-2 ${isActive('/admin') ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
            >
              Console
              {isActive('/admin') && <m.div layoutId="navline" className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 rounded-full" />}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900 leading-none">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Reader Member</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="btn-luxury px-6 py-2.5 rounded-full green-gradient text-white font-bold text-sm shadow-xl shadow-green-500/20 hover:shadow-green-500/40"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;