
import React from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, Sparkles, ShieldCheck, Globe, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Poster Branding */}
      <m.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="hidden md:flex flex-1 relative bg-gray-900 overflow-hidden items-center justify-center p-20"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-green-500 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-green-700 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-lg space-y-12">
          <m.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 border-green-500 overflow-hidden rotate-3"
          >
            <span className="text-gray-900 font-serif font-bold text-4xl italic">SA</span>
          </m.div>

          <div className="space-y-6">
            <m.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-6xl font-serif font-bold text-white leading-tight"
            >
              The Sanctuary of <span className="text-green-400 italic">Visionaries.</span>
            </m.h1>
            <m.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-400 text-xl font-medium leading-relaxed"
            >
              Access premium archives, curated masterclasses, and an exclusive community of modern readers.
            </m.p>
          </div>

          <m.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-8 items-center pt-8 border-t border-white/10"
          >
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl">10k+</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Archives</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl">Premium</span>
              <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Quality</span>
            </div>
          </m.div>
        </div>
      </m.div>

      {/* Right Side: Login Form */}
      <m.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/30"
      >
        <div className="w-full max-w-sm space-y-12">
          <div className="space-y-4">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-green-600 font-bold uppercase tracking-[0.3em] text-[10px]"
            >
              <Sparkles size={14} /> Secure Entrance
            </m.div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Step back into your digital haven. Verified access only.
            </p>
          </div>

          <div className="space-y-6">
            <m.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              className="group flex items-center justify-between gap-4 w-full p-5 rounded-3xl bg-white border border-gray-200 text-gray-900 font-bold hover:border-green-500 hover:shadow-xl hover:shadow-green-500/5 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                </div>
                <span>Continue with Google</span>
              </div>
              <ArrowRight size={20} className="text-gray-300 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all" />
            </m.button>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col items-center text-center space-y-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">End-to-End Encryption</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col items-center text-center space-y-2">
                <Globe size={20} className="text-blue-500" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Accessibility</span>
              </div>
            </div>
          </div>

          <div className="pt-12 text-center">
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              By entering, you agree to our <span className="text-gray-900 font-bold underline cursor-pointer">Protocol of Use</span> and <span className="text-gray-900 font-bold underline cursor-pointer">Security Terms</span>.
            </p>
            <button 
              onClick={() => window.location.href = '#/'}
              className="mt-8 text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
            >
              ← Return to Public Store
            </button>
          </div>
        </div>
      </m.div>
    </div>
  );
};

export default Auth;
