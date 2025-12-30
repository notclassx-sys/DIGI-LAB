
import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Book } from '../types';
import { MERCHANT_UPI_ID, MERCHANT_NAME, CURRENCY } from '../constants';
import { ShoppingCart, X, AlertCircle, ExternalLink, Sparkles, BookOpen, Crown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

interface StoreProps {
  user: User | null;
}

const Store: React.FC<StoreProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingBook, setBuyingBook] = useState<Book | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'pending' | 'confirming'>('idle');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (!error && data) setBooks(data);
    setLoading(false);
  };

  const handleBuyNow = (book: Book) => {
    if (!user) { navigate('/auth'); return; }
    setBuyingBook(book);
    setPurchaseStatus('pending');
  };

  const getUPILink = (book: Book) => {
    const url = new URL('upi://pay');
    url.searchParams.append('pa', MERCHANT_UPI_ID);
    url.searchParams.append('pn', MERCHANT_NAME);
    url.searchParams.append('am', book.price.toString());
    url.searchParams.append('cu', CURRENCY);
    url.searchParams.append('tn', `Acquire: ${book.title}`);
    return url.toString();
  };

  const confirmPayment = async () => {
    if (!buyingBook || !user) return;
    setPurchaseStatus('confirming');
    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      book_id: buyingBook.id,
      payment_status: 'pending'
    });
    if (!error) {
      alert('Transaction Submitted. Verification in progress.');
      setBuyingBook(null);
      setPurchaseStatus('idle');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <m.div animate={{ rotate: 360 }} className="h-10 w-10 border-4 border-slate-100 border-t-emerald-600 rounded-full" />
    </div>
  );

  return (
    <div className="pt-32 pb-40 space-y-40">
      {/* Hero Section */}
      <section className="relative px-6 flex flex-col items-center text-center">
        <m.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-emerald-100 bg-emerald-50/50 text-emerald-800 text-[9px] font-black uppercase tracking-[0.4em] mb-12"
        >
          <Crown size={12} className="text-[#d4af37]" /> The Collector's Choice
        </m.div>
        
        <m.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-7xl md:text-9xl font-serif font-bold text-slate-950 tracking-tight leading-none"
        >
          Private <span className="gold-text italic">Curations</span><br/>
          <span className="text-emerald-900">Archived</span>
        </m.h1>

        <m.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mt-12 leading-relaxed italic"
        >
          Explore a meticulously curated sanctuary of digital manuscripts, crafted for the visionary mind.
        </m.p>
      </section>

      {/* Grid */}
      <section className="px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {books.map((book, idx) => (
            <m.div 
              key={book.id} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx % 3 * 0.1, duration: 0.6 }}
              className="luxury-card group p-10 rounded-[3rem] relative flex flex-col h-full overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 green-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex-grow">
                <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-emerald-800 mb-10 group-hover:bg-emerald-900 group-hover:text-white transition-all duration-500 shadow-inner">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 leading-tight mb-4 group-hover:text-emerald-800 transition-colors">
                  {book.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-4 font-medium italic">
                  {book.description}
                </p>
              </div>
              
              <div className="mt-12 pt-10 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-[0.3em] text-[#d4af37] font-black">Investment</span>
                  <span className="text-3xl font-extrabold text-slate-950 tracking-tighter">₹{book.price}</span>
                </div>
                <button 
                  onClick={() => handleBuyNow(book)}
                  className="btn-luxury px-9 py-4 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-slate-900/10 hover:bg-emerald-950"
                >
                  <ShoppingCart size={14} className="text-[#d4af37]" />
                  Acquire
                </button>
              </div>
            </m.div>
          ))}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {buyingBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuyingBook(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <m.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-700" size={24} />
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Secure Settlement</h3>
                    <p className="text-[8px] uppercase tracking-widest font-black text-[#d4af37] mt-0.5">Encrypted Acquisition Protocol</p>
                  </div>
                </div>
                <button onClick={() => setBuyingBook(null)} className="p-3 hover:bg-white rounded-full text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-12 space-y-10">
                <div className="text-center space-y-3">
                  <p className="text-slate-400 uppercase tracking-widest text-[9px] font-black">Authorized Unit</p>
                  <p className="text-4xl font-serif font-bold text-slate-900 leading-tight">"{buyingBook.title}"</p>
                  <div className="inline-block px-8 py-3 rounded-2xl bg-emerald-50 text-emerald-900 font-black text-2xl border border-emerald-100">
                    ₹{buyingBook.price}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-5 border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-900 font-black uppercase tracking-widest text-[10px]">
                    <Sparkles size={14} className="text-[#d4af37]" />
                    Acquisition Steps
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Trigger payment via our secure UPI gateway.',
                      'Finalize authentication in your banking vault.',
                      'Submit the execution confirmation below.',
                      'Verification usually completes within 60 minutes.'
                    ].map((step, i) => (
                      <li key={i} className="flex gap-4 text-xs text-slate-500 font-semibold italic">
                        <span className="text-emerald-800 font-black">{i + 1}.</span> {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <m.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={getUPILink(buyingBook)}
                    className="flex items-center justify-center gap-3 w-full py-6 rounded-[2rem] bg-emerald-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20"
                  >
                    Launch UPI Portal <ExternalLink size={18} />
                  </m.a>
                  
                  <button 
                    onClick={confirmPayment}
                    disabled={purchaseStatus === 'confirming'}
                    className="w-full py-6 rounded-[2rem] bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100 flex items-center justify-center gap-2"
                  >
                    {purchaseStatus === 'confirming' ? 'Verifying...' : 'Notify Curator of Execution'}
                  </button>
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Store;
