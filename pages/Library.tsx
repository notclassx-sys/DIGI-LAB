
import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Purchase } from '../types';
import { BookOpen, Lock, FileText, Download, Loader2, Bookmark, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const m = motion as any;

interface LibraryProps {
  user: User;
}

const Library: React.FC<LibraryProps> = ({ user }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingPath, setSigningPath] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select('*, book:books(*)')
      .eq('user_id', user.id)
      .eq('payment_status', 'completed');

    if (!error && data) {
      setPurchases(data);
    }
    setLoading(false);
  };

  const handleViewPdf = async (pdfPath: string) => {
    setSigningPath(pdfPath);
    try {
      const { data, error } = await supabase.storage.from('books_private').createSignedUrl(pdfPath, 600);
      if (error) throw error;
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    } catch (err) {
      alert('Security clearance failed. Authentication required.');
    } finally {
      setSigningPath(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <m.div animate={{ rotate: 360 }} className="h-12 w-12 border-4 border-gray-50 border-t-[#d4af37] rounded-full" />
      </div>
    );
  }

  return (
    <div className="pb-40 max-w-7xl mx-auto px-6 space-y-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <m.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-[#d4af37] font-black uppercase tracking-[0.4em] text-[10px]"
          >
            <Sparkles size={14} className="fill-[#d4af37]" /> The Collector's Vault
          </m.div>
          <m.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-display font-bold text-gray-900"
          >
            Personal <span className="italic gold-text">Archives</span>
          </m.h1>
        </div>
      </div>

      {purchases.length === 0 ? (
        <m.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50/50 border border-gray-100 rounded-[4rem] p-32 text-center space-y-10"
        >
          <div className="w-32 h-32 mx-auto bg-white rounded-[3rem] flex items-center justify-center text-gray-200 shadow-xl border border-slate-100">
            <Lock size={48} />
          </div>
          <div className="space-y-4">
            <h3 className="text-4xl font-display font-bold text-gray-900">The Vault is Silent</h3>
            <p className="text-gray-400 font-medium text-lg italic max-w-sm mx-auto">No acquisitions recorded.</p>
          </div>
          <m.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/#/" 
            className="inline-block px-12 py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl"
          >
            Browse Public Archives
          </m.a>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {purchases.map((purchase, idx) => {
            const book = purchase.book;
            if (!book) return null;

            return (
              <m.div 
                key={purchase.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center text-emerald-800 shadow-inner border border-slate-100">
                      {book.thumbnail_path ? (
                        <img 
                          src={supabase.storage.from('books_public').getPublicUrl(book.thumbnail_path).data.publicUrl} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText size={28} />
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] bg-emerald-50 px-4 py-2 rounded-full font-black">
                      Verified
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-display font-bold text-gray-900 group-hover:text-emerald-900 transition-colors leading-tight">
                      {book.title}
                    </h3>
                  </div>

                  <button 
                    onClick={() => handleViewPdf(book.pdf_path)}
                    disabled={signingPath === book.pdf_path}
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-950 transition-all disabled:opacity-50"
                  >
                    {signingPath === book.pdf_path ? (
                      <Loader2 size={18} className="animate-spin text-[#d4af37]" />
                    ) : (
                      <>
                        <Download size={18} className="text-[#d4af37]" />
                        Access Manuscript
                      </>
                    )}
                  </button>
                </div>
              </m.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Library;
