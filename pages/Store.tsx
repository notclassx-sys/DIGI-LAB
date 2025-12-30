
import React, { useEffect, useState } from 'react';
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Book } from '../types';
import { MERCHANT_UPI_ID, MERCHANT_NAME, CURRENCY } from '../constants';
import { ShoppingCart, X, ExternalLink, Sparkles, BookOpen, Crown, ShieldCheck, Copy, Check, Star, Zap, Info, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

const Store: React.FC<{ user: User | null }> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingBook, setBuyingBook] = useState<Book | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'pending' | 'confirming'>('idle');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
      if (data) setBooks(data);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  const handleBuyNow = (book: Book) => {
    if (!user) { navigate('/auth'); return; }
    setBuyingBook(book);
    setPurchaseStatus('pending');
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
      alert('Order Placed! Please allow 15-60 mins for curator verification.');
      setBuyingBook(null);
      setPurchaseStatus('idle');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <m.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="h-8 w-8 border-2 border-slate-200 border-t-accent rounded-full" />
    </div>
  );

  return (
    <div className="pb-24">
      {/* Hero Section - Scaled for Mobile */}
      <section className="px-4 pt-6 pb-10 text-center space-y-4 max-w-4xl mx-auto">
        <m.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-900 text-[8px] font-bold uppercase tracking-widest"
        >
          <Crown size={12} className="text-accent" /> THE COLLECTOR'S CHOICE
        </m.div>
        
        <h1 className="text-3xl md:text-6xl font-display font-bold text-obsidian leading-tight tracking-tight">
          Private <span className="font-serif italic gold-text">Curations</span> Archived
        </h1>

        <p className="text-slate-400 font-medium text-xs md:text-lg max-w-xl mx-auto leading-relaxed px-4">
          A meticulously curated sanctuary of digital manuscripts, crafted for the visionary mind.
        </p>
      </section>

      {/* Grid Container */}
      <div className="px-2 md:px-6 max-w-7xl mx-auto">
        {/* Meesho Style 2-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6">
          {books.map((book, idx) => (
            <m.div 
              key={book.id} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleBuyNow(book)}
              className="product-card group flex flex-col cursor-pointer"
            >
              {/* Product Visual */}
              <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                {book.thumbnail_path ? (
                  <img 
                    src={supabase.storage.from('books_public').getPublicUrl(book.thumbnail_path).data.publicUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <BookOpen size={32} />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[7px] font-black uppercase text-emerald-900 shadow-sm border border-slate-100">
                  Premium
                </div>
              </div>

              {/* Product Info */}
              <div className="p-2.5 md:p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-[11px] md:text-sm font-bold text-obsidian line-clamp-2 leading-snug h-8 md:h-10">
                    {book.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => <Star key={i} size={8} className="fill-current" />)}
                    </div>
                    <span className="text-[8px] text-slate-400 font-bold">(4.9)</span>
                  </div>
                </div>

                <div className="mt-2.5 space-y-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm md:text-xl font-black text-obsidian">₹{book.price}</span>
                    <span className="text-[9px] text-slate-400 line-through">₹{Math.round(book.price * 1.5)}</span>
                  </div>
                  
                  <button className="w-full py-2 md:py-3 bg-obsidian text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5">
                    Acquire <ArrowUpRight size={10} />
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>

      {/* Checkout Sheet (Mobile-first modal) */}
      <AnimatePresence>
        {buyingBook && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuyingBook(null)}
              className="absolute inset-0 bg-obsidian/40 backdrop-blur-sm"
            />
            <m.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  <span className="font-bold text-sm text-obsidian uppercase tracking-widest">Secure Checkout</span>
                </div>
                <button onClick={() => setBuyingBook(null)} className="p-2 text-slate-300">
                  <X size={24} />
                </button>
              </div>

              <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-16 h-20 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                  {buyingBook.thumbnail_path && <img src={supabase.storage.from('books_public').getPublicUrl(buyingBook.thumbnail_path).data.publicUrl} className="w-full h-full object-cover" />}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-obsidian uppercase">{buyingBook.title}</h4>
                  <div className="text-xl font-black text-obsidian">₹{buyingBook.price}</div>
                  <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 inline-block px-2 py-0.5 rounded">Digital Delivery</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Merchant UPI</p>
                  <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <code className="text-[11px] font-black text-obsidian truncate">{MERCHANT_UPI_ID}</code>
                    <button onClick={copyUPI} className="shrink-0 p-2 text-emerald-600">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                   <a 
                    href={`upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${buyingBook.price}&cu=INR&tn=Order_${buyingBook.id.slice(0,8)}`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg !no-underline"
                  >
                    Pay with UPI App <Zap size={12} className="fill-white" />
                  </a>
                  <button 
                    onClick={confirmPayment}
                    disabled={purchaseStatus === 'confirming'}
                    className="w-full py-4 bg-obsidian text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-950 transition-all disabled:opacity-50"
                  >
                    {purchaseStatus === 'confirming' ? 'Notifying Curators...' : 'I Have Paid (Confirm)'}
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
