
import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Purchase } from '../types';
import { BookOpen, Lock, FileText, Download, Loader2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

// Cast motion to any to bypass broken property types in the current environment
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
      alert('Security clearance failed. Please contact administrator.');
    } finally {
      setSigningPath(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <m.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-10 w-10 border-4 border-green-100 border-t-green-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <m.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-green-600 mb-2 font-bold uppercase tracking-widest text-[10px]"
          >
            <Bookmark size={14} /> Your Sanctuary
          </m.div>
          <m.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-gray-900"
          >
            Personal <span className="green-text italic">Collection</span>
          </m.h1>
        </div>
        <p className="text-gray-400 font-medium text-sm md:text-right max-w-xs">
          Only the finest acquisitions make it to your private digital archive.
        </p>
      </div>

      {purchases.length === 0 ? (
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-100 rounded-[3rem] p-20 text-center shadow-sm space-y-8"
        >
          <div className="w-24 h-24 mx-auto bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 shadow-inner">
            <Lock size={48} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-serif font-bold text-gray-900">Your Archive is Waiting</h3>
            <p className="text-gray-400 font-medium max-w-sm mx-auto">Expand your library by discovering our latest masterclasses in the store.</p>
          </div>
          <m.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/#/" 
            className="inline-block px-10 py-4 green-gradient text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all"
          >
            Browse Store
          </m.a>
        </m.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {purchases.map((purchase, idx) => {
            const book = purchase.book;
            if (!book) return null;

            return (
              <m.div 
                key={purchase.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white border border-gray-100 p-8 rounded-[2.5rem] hover:border-green-300 hover:shadow-2xl hover:shadow-green-500/5 transition-all duration-500"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                      <FileText size={24} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-bold shadow-sm">
                      Access Granted
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-3 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleViewPdf(book.pdf_path)}
                    disabled={signingPath === book.pdf_path}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-green-600 hover:text-white transition-all duration-300 disabled:opacity-50 border border-gray-100 shadow-sm"
                  >
                    {signingPath === book.pdf_path ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Download size={20} />
                        Read Archive
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