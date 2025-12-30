
import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Book } from '../types';
import { MERCHANT_UPI_ID, MERCHANT_NAME, CURRENCY } from '../constants';
import { ShoppingCart, X, ExternalLink, Sparkles, BookOpen, Crown, ShieldCheck, Copy, Check, ArrowRight, Zap, Image as ImageIcon } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
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
    url.searchParams.append('tn', `SNIPX: ${book.title}`);
    return url.toString();
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      alert('Transaction Submitted. Verification in progress. Please allow 15-60 mins for verification.');
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
    <div className="pb-20 space-y-12">
      {/* Hero Section with single line heading */}
      <section className="text-center py-20 px-4 space-y-8 max-w-7xl mx-auto overflow-hidden">
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-50/50 border border-emerald-100/50 text-emerald-800 text-[10px] font-black uppercase tracking-[0.3em]"
        >
          <Crown size={12} className="text-accent" /> THE COLLECTOR'S CHOICE
        </m.div>
        
        <m.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9.5rem] font-display font-bold text-obsidian leading-[1.1] md:leading-[0.85] tracking-tight"
        >
          Private <span className="font-serif italic gold-text">Curations</span> <span className="text-emerald-900">Archived</span>
        </m.h1>

        <m.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 font-medium italic text-lg md:text-xl max-w-2xl mx-auto leading-relaxed pt-4"
        >
          Explore a meticulously curated sanctuary of digital manuscripts, crafted for the visionary mind.
        </m.p>
      </section>

      {/* Grid with correct font application */}
      <section className="px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book, idx) => (
          <m.div 
            key={book.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[3.5rem] p-12 flex flex-col h-full border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 group relative"
          >
            <div className="mb-10 relative">
              <div className="w-24 h-32 rounded-[2rem] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group-hover:border-emerald-200 transition-colors">
                {book.thumbnail_path ? (
                  <img 
                    src={supabase.storage.from('books_public').getPublicUrl(book.thumbnail_path).data.publicUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <BookOpen size={32} className="text-emerald-800" />
                )}
              </div>
            </div>

            <div className="flex-grow space-y-4">
              <h3 className="text-4xl font-display font-bold text-obsidian leading-none tracking-tight group-hover:text-emerald-900 transition-colors uppercase">
                {book.title}
              </h3>
              <p className="text-slate-400 font-medium text-base italic leading-relaxed line-clamp-4 pt-2">
                {book.description}
              </p>
            </div>

            <div className="mt-14 pt-10 border-t border-slate-50 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Investment</p>
                <p className="text-5xl font-black text-obsidian leading-none tracking-tighter">₹{book.price}</p>
              </div>
              <button 
                onClick={() => handleBuyNow(book)}
                className="flex items-center gap-2.5 px-10 py-5 bg-obsidian text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-950 transition-all active:scale-95"
              >
                <ShoppingCart size={18} className="text-accent" /> Acquire
              </button>
            </div>
          </m.div>
        ))}
      </section>

      {/* Modal - Reverted to clean aesthetic */}
      <AnimatePresence>
        {buyingBook && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuyingBook(null)}
              className="absolute inset-0 bg-obsidian/60 backdrop-blur-md"
            />
            <m.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[4rem] overflow-hidden shadow-2xl"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="text-emerald-700" size={28} />
                  <span className="font-display font-bold text-2xl text-obsidian">Secure Entry</span>
                </div>
                <button onClick={() => setBuyingBook(null)} className="p-2 text-slate-400 hover:text-obsidian transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-12 space-y-10">
                <div className="text-center space-y-3">
                  <p className="text-6xl font-black text-obsidian tracking-tighter">₹{buyingBook.price}</p>
                  <p className="text-slate-500 font-bold text-sm italic uppercase tracking-widest">"{buyingBook.title}"</p>
                </div>

                <div className="bg-slate-50 rounded-[3rem] p-10 space-y-8 border border-slate-100">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">RECIPIENT GATEWAY</p>
                    <div className="flex items-center justify-between gap-4 p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm">
                      <code className="text-[12px] font-black text-obsidian truncate tracking-tight">{MERCHANT_UPI_ID}</code>
                      <button onClick={copyUPI} className="shrink-0 p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                      <Sparkles size={14} /> PROTOCOL
                    </p>
                    <ol className="text-[12px] text-slate-500 font-semibold italic space-y-3 ml-2">
                      <li className="flex gap-3"><span>1.</span> Dispatch UPI settlement</li>
                      <li className="flex gap-3"><span>2.</span> Archive transaction visual</li>
                      <li className="flex gap-3"><span>3.</span> Trigger verification below</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-4">
                  <m.a 
                    whileTap={{ scale: 0.98 }}
                    href={getUPILink(buyingBook)}
                    className="md:hidden flex items-center justify-center gap-3 w-full py-6 bg-emerald-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl"
                  >
                    DEPLOY UPI PORTAL <ExternalLink size={16} />
                  </m.a>
                  <button 
                    onClick={confirmPayment}
                    disabled={purchaseStatus === 'confirming'}
                    className="w-full py-6 bg-obsidian text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-emerald-950 transition-all disabled:opacity-50"
                  >
                    {purchaseStatus === 'confirming' ? 'TRANSMITTING...' : 'I HAVE SETTLED (NOTIFY)'}
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
