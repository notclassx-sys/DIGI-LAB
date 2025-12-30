
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
    <div className="flex justify-center items-center min-h-[50vh]">
      <m.div animate={{ rotate: 360 }} className="h-10 w-10 border-4 border-slate-100 border-t-emerald-600 rounded-full" />
    </div>
  );

  return (
    <div className="pt-8 md:pt-16 pb-20 space-y-16 md:space-y-32">
      {/* Hero Section */}
      <section className="relative px-4 md:px-6 flex flex-col items-center text-center">
        <m.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-emerald-100 bg-emerald-50/50 text-emerald-800 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-8 md:mb-12"
        >
          <Crown size={12} className="text-[#d4af37]" /> The Collector's Choice
        </m.div>
        
        <m.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-9xl font-serif font-bold text-slate-950 tracking-tight leading-[1.1] md:leading-none"
        >
          Private <span className="gold-text italic">Curations</span><br/>
          <span className="text-emerald-900">Archived</span>
        </m.h1>

        <m.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 text-sm md:text-xl font-medium max-w-2xl mt-6 md:mt-12 leading-relaxed italic px-4"
        >
          Explore a meticulously curated sanctuary of digital manuscripts, crafted for the visionary mind.
        </m.p>
      </section>

      {/* Grid */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
          {books.map((book, idx) => (
            <m.div 
              key={book.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx % 3 * 0.1 }}
              className="luxury-card group p-6 md:p-10 rounded-2xl md:rounded-[3rem] relative flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 green-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex-grow">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2rem] bg-slate-50 flex items-center justify-center text-emerald-800 mb-6 md:mb-10 group-hover:bg-emerald-900 group-hover:text-white transition-all duration-500 shadow-inner">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-tight mb-3 md:mb-4 group-hover:text-emerald-800 transition-colors">
                  {book.title}
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-4 font-medium italic">
                  {book.description}
                </p>
              </div>
              
              <div className="mt-8 md:mt-12 pt-6 md:pt-10 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[7px] md:text-[8px] uppercase tracking-[0.2em] text-[#d4af37] font-black">Investment</span>
                  <span className="text-xl md:text-3xl font-extrabold text-slate-950 tracking-tighter">₹{book.price}</span>
                </div>
                <button 
                  onClick={() => handleBuyNow(book)}
                  className="btn-luxury px-6 py-3 md:px-9 md:py-4 rounded-xl md:rounded-2xl bg-slate-950 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-emerald-950"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuyingBook(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <m.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl md:rounded-[4rem] overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-700 shrink-0" size={24} />
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">Secure Settlement</h3>
                    <p className="text-[7px] md:text-[8px] uppercase tracking-widest font-black text-[#d4af37] mt-0.5">Encrypted Protocol</p>
                  </div>
                </div>
                <button onClick={() => setBuyingBook(null)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-all">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 md:p-12 space-y-8 md:space-y-10">
                <div className="text-center space-y-2">
                  <p className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">₹{buyingBook.price}</p>
                  <p className="text-slate-500 font-bold text-sm italic">"{buyingBook.title}"</p>
                </div>

                <div className="bg-slate-50 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[9px] md:text-[10px]">
                    <Sparkles size={12} className="text-[#d4af37]" />
                    Process
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Trigger payment via UPI portal.',
                      'Submit execution confirmation.',
                      'Access granted within 60 mins.'
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-xs text-slate-500 font-semibold italic">
                        <span className="text-emerald-800 font-black">{i + 1}.</span> {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <m.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={getUPILink(buyingBook)}
                    className="flex items-center justify-center gap-2 w-full py-5 rounded-2xl bg-emerald-900 text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-xl"
                  >
                    Launch UPI Portal <ExternalLink size={16} />
                  </m.a>
                  
                  <button 
                    onClick={confirmPayment}
                    disabled={purchaseStatus === 'confirming'}
                    className="w-full py-5 rounded-2xl bg-slate-50 text-slate-900 font-black text-[9px] uppercase tracking-widest hover:bg-slate-100 border border-slate-100"
                  >
                    {purchaseStatus === 'confirming' ? 'Notifying Curator...' : 'Notify Curator'}
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
