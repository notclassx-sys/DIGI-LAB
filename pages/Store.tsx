
import React, { useEffect, useState } from 'react';
// Use namespace import and cast to any to bypass broken react-router-dom types
import * as RRD from 'react-router-dom';
const { useNavigate } = RRD as any;
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Book } from '../types';
import { MERCHANT_UPI_ID, MERCHANT_NAME, CURRENCY } from '../constants';
import { ShoppingCart, X, AlertCircle, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion to any to bypass broken property types in the current environment
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
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  };

  const handleBuyNow = (book: Book) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setBuyingBook(book);
    setPurchaseStatus('pending');
  };

  const getUPILink = (book: Book) => {
    const url = new URL('upi://pay');
    url.searchParams.append('pa', MERCHANT_UPI_ID);
    url.searchParams.append('pn', MERCHANT_NAME);
    url.searchParams.append('am', book.price.toString());
    url.searchParams.append('cu', CURRENCY);
    url.searchParams.append('tn', `Purchase: ${book.title}`);
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

    if (error) {
      alert('Error recording purchase. Please contact support.');
    } else {
      alert('Your request is being processed. Once verified by Admin, the book will appear in your Library.');
      setBuyingBook(null);
      setPurchaseStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <m.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 border-4 border-green-100 border-t-green-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-50 rounded-[100%] blur-[120px] -z-10 opacity-60"></div>
        <div className="text-center space-y-6 max-w-4xl mx-auto px-6">
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest border border-green-100"
          >
            <Sparkles size={14} /> Curated Luxury Collection
          </m.div>
          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-serif font-bold text-gray-900 tracking-tight leading-tight"
          >
            Elevate Your <span className="green-text">Intellect</span>
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Step into the sanctuary of high-end digital literature. Exclusive insights, masterfully curated for the modern visionary.
          </m.p>
        </div>
      </section>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
        {books.map((book, idx) => (
          <m.div 
            key={book.id} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 flex flex-col h-full"
          >
            <div className="mb-6 flex-grow">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-500">
                <BookOpen size={28} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-green-700 transition-colors">
                {book.title}
              </h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-4">
                {book.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Investment</span>
                <span className="text-2xl font-bold text-gray-900">₹{book.price}</span>
              </div>
              <button 
                onClick={() => handleBuyNow(book)}
                className="btn-luxury px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:green-gradient hover:shadow-green-500/20 transition-all flex items-center gap-2"
              >
                <ShoppingCart size={18} />
                Acquire
              </button>
            </div>
          </m.div>
        ))}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {buyingBook && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuyingBook(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
            />
            <m.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white border border-gray-100 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold text-gray-900">Secure Acquisition</h3>
                <button onClick={() => setBuyingBook(null)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Selected Title</p>
                  <p className="text-3xl font-serif font-bold text-gray-900 leading-tight">{buyingBook.title}</p>
                  <div className="inline-block px-4 py-1 rounded-full bg-green-50 text-green-700 font-bold text-xl mt-4">
                    ₹{buyingBook.price}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-gray-900 font-bold">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <AlertCircle size={20} className="text-green-500" />
                    </div>
                    <span>Protocol for Payment</span>
                  </div>
                  <ol className="text-sm text-gray-500 list-decimal list-inside space-y-3 font-medium">
                    <li>Initialize payment via UPI deep link.</li>
                    <li>Finalize the transfer in your secure app.</li>
                    <li>Verify your transaction status below.</li>
                    <li>Wait for the sanctuary gates to open.</li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <m.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={getUPILink(buyingBook)}
                    className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl green-gradient text-white font-bold text-lg shadow-xl shadow-green-500/20 hover:shadow-green-500/40 transition-all"
                  >
                    Pay via UPI <ExternalLink size={20} />
                  </m.a>
                  
                  <button 
                    onClick={confirmPayment}
                    disabled={purchaseStatus === 'confirming'}
                    className="w-full py-5 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {purchaseStatus === 'confirming' ? (
                      <m.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full" />
                    ) : 'I Have Completed Payment'}
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