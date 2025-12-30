
import React from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, Sparkles, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const m = motion as any;

const Auth: React.FC = () => {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6 overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[100px]" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-[3rem] p-10 md:p-14 shadow-2xl relative z-10"
      >
        <div className="space-y-12">
          {/* Logo/Header */}
          <div className="text-center space-y-4">
            <m.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-obsidian rounded-2xl mx-auto flex items-center justify-center border border-accent/20"
            >
              <span className="text-accent font-serif font-bold text-2xl italic">SA</span>
            </m.div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-obsidian uppercase">Access Vault</h2>
              <p className="text-slate-400 text-xs font-medium tracking-wide">Identify yourself to unlock the archives.</p>
            </div>
          </div>

          {/* Social Auth */}
          <div className="space-y-4">
            <m.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="group flex items-center justify-between w-full p-5 rounded-2xl bg-white border border-slate-100 text-obsidian font-black text-xs uppercase tracking-widest hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span>Login with Google</span>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-accent transform group-hover:translate-x-1 transition-all" />
            </m.button>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none">Verified Security Protocol Active</p>
            </div>
          </div>

          {/* Footer Link */}
          <div className="text-center pt-8 border-t border-slate-50">
            <button 
              onClick={() => window.location.href = '#/'}
              className="text-[10px] font-black text-slate-400 hover:text-obsidian uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft size={14} /> Back to Store
            </button>
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default Auth;
