
import React, { useState, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { Routes, Route, Link, useNavigate } = RRD as any;
import { supabase } from '../supabaseClient';
import { Book, Purchase } from '../types';
import { 
  Trash2, Book as BookIcon, Package, Upload, Loader2, ArrowLeft, PlusCircle, AlertTriangle, ShieldCheck as Shield, Image as ImageIcon, Check, X as XIcon, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

const AdminDashboard = () => {
  const [stats, setStats] = useState({ books: 0, sales: 0, pending: 0 });

  useEffect(() => {
    const getStats = async () => {
      const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true });
      const { count: salesCount } = await supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('payment_status', 'completed');
      const { count: pendingCount } = await supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending');
      setStats({ 
        books: booksCount || 0, 
        sales: salesCount || 0, 
        pending: pendingCount || 0 
      });
    };
    getStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-20 pb-40">
      <div className="space-y-4">
        <h1 className="text-6xl font-display font-bold text-obsidian uppercase">Control <span className="italic font-serif gold-text">Nexus</span></h1>
        <p className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Administrative Oversight Protocol</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { label: 'Collection Size', val: stats.books, icon: BookIcon, color: 'emerald' },
          { label: 'Settled Assets', val: stats.sales, icon: Package, color: 'accent' },
          { label: 'Pending Audits', val: stats.pending, icon: Shield, color: 'blue' }
        ].map((stat, i) => (
          <m.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 bg-slate-50 rounded-2xl text-obsidian border border-slate-100`}>
                <stat.icon size={24} />
              </div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-6xl font-black text-obsidian tracking-tighter">{stat.val}</p>
          </m.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-6 p-6 bg-slate-50/50 rounded-[3rem] border border-slate-100 w-fit">
        <Link to="add-book" className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-obsidian text-white shadow-xl hover:bg-emerald-950 transition-all font-black text-[10px] uppercase tracking-widest">
          <PlusCircle size={16} className="text-accent" />
          Add Manuscript
        </Link>
        <Link to="books" className="px-10 py-5 rounded-2xl bg-white text-obsidian shadow-sm hover:bg-slate-100 transition-all font-black text-[10px] border border-slate-100 uppercase tracking-widest">Archive Management</Link>
        <Link to="purchases" className="px-10 py-5 rounded-2xl bg-white text-obsidian shadow-sm hover:bg-slate-100 transition-all font-black text-[10px] border border-slate-100 uppercase tracking-widest">Settlement Audit</Link>
      </div>
    </div>
  );
};

const AddBookPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !thumbFile) {
      setErrorMsg("Both visual and manuscript assets are required.");
      return;
    }
    setLoading(true);
    try {
      const thumbName = `thumb-${Date.now()}-${thumbFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: thumbData, error: thumbError } = await supabase.storage.from('books_public').upload(thumbName, thumbFile);
      if (thumbError) throw thumbError;

      const pdfName = `pdf-${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: pdfData, error: pdfError } = await supabase.storage.from('books_private').upload(pdfName, pdfFile);
      if (pdfError) throw pdfError;

      const { error: insertError } = await supabase.from('books').insert({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        pdf_path: pdfData.path,
        thumbnail_path: thumbData.path
      });
      if (insertError) throw insertError;

      navigate('/admin/books');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 space-y-12 pb-40">
      <div className="flex items-center gap-6">
        <button onClick={() => navigate('/admin')} className="p-4 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-obsidian transition-all shadow-sm">
          <ArrowLeft size={24} />
        </button>
        <div className="space-y-1">
          <h2 className="text-4xl font-display font-bold text-obsidian uppercase">Archive Expansion</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-accent">Protocol of Publication</p>
        </div>
      </div>

      <m.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-12 md:p-20 rounded-[4rem] border border-slate-50 shadow-2xl space-y-12"
      >
        <AnimatePresence>
          {errorMsg && (
            <m.div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] flex items-start gap-4">
              <AlertTriangle className="text-red-500 shrink-0 mt-1" size={24} />
              <div className="space-y-1">
                <p className="text-red-900 font-black text-[10px] uppercase tracking-widest">Protocol Failure</p>
                <p className="text-red-600 text-sm italic font-medium">{errorMsg}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Manuscript Title</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 text-obsidian p-6 rounded-2xl outline-none border border-transparent focus:border-accent transition-all font-bold text-lg"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Investment Value (INR)</label>
            <input 
              type="number" required
              className="w-full bg-slate-50 text-obsidian p-6 rounded-2xl outline-none border border-transparent focus:border-accent transition-all font-bold text-lg tracking-tight"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Archive Description</label>
          <textarea 
            required
            className="w-full bg-slate-50 text-obsidian p-8 rounded-[2.5rem] outline-none border border-transparent focus:border-accent transition-all h-40 font-medium italic text-lg leading-relaxed"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Visual Asset (Thumbnail)</label>
            <label className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-all">
              <ImageIcon className="text-slate-300 mb-4" size={32} />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest truncate max-w-full px-4">
                {thumbFile ? thumbFile.name : "Upload Visual"}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Data Manuscript (PDF)</label>
            <label className="flex flex-col items-center justify-center w-full p-12 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-all">
              <Upload className="text-slate-300 mb-4" size={32} />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest truncate max-w-full px-4">
                {pdfFile ? pdfFile.name : "Upload PDF"}
              </span>
              <input type="file" className="hidden" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-8 rounded-[2rem] bg-obsidian text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-950 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <><Shield size={20} className="text-accent" /> Execute Publication</>}
        </button>
      </m.form>
    </div>
  );
};

const ManageBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => { fetchBooks(); }, []);
  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (data) setBooks(data);
  };
  const deleteBook = async (book: Book) => {
    if (!confirm('Permanent deletion from the sanctuary archives. Proceed?')) return;
    await supabase.from('books').delete().eq('id', book.id);
    if (book.pdf_path) await supabase.storage.from('books_private').remove([book.pdf_path]);
    if (book.thumbnail_path) await supabase.storage.from('books_public').remove([book.thumbnail_path]);
    fetchBooks();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 space-y-12 pb-40">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-display font-bold text-obsidian uppercase">Archive Roster</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-accent">Active Collection Manifest</p>
        </div>
        <Link to="/admin/add-book" className="px-10 py-5 bg-obsidian text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">New Entry</Link>
      </div>
      <div className="grid gap-6">
        {books.map(book => (
          <div key={book.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-10">
              <div className="w-20 h-28 bg-slate-50 rounded-2xl overflow-hidden shadow-inner border border-slate-100 flex items-center justify-center">
                 {book.thumbnail_path ? <img src={supabase.storage.from('books_public').getPublicUrl(book.thumbnail_path).data.publicUrl} className="w-full h-full object-cover" /> : <BookIcon className="text-slate-200" />}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-obsidian text-2xl uppercase tracking-tight">{book.title}</div>
                <div className="text-accent font-black text-sm tracking-widest uppercase">₹{book.price}</div>
              </div>
            </div>
            <button onClick={() => deleteBook(book)} className="p-6 bg-red-50 text-red-400 rounded-3xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24} strokeWidth={1.5} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManagePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  useEffect(() => { fetchPurchases(); }, []);
  const fetchPurchases = async () => {
    const { data } = await supabase.from('purchases').select('*, book:books(*)').order('created_at', { ascending: false });
    if (data) setPurchases(data);
  };
  const updateStatus = async (id: string, status: string) => {
    await supabase.from('purchases').update({ payment_status: status }).eq('id', id);
    fetchPurchases();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 space-y-12 pb-40">
       <div className="space-y-1">
          <h2 className="text-4xl font-display font-bold text-obsidian uppercase">Settlement Audit</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-accent">Financial Transaction Oversight</p>
        </div>
      <div className="grid gap-8">
        {purchases.map(p => (
          <div key={p.id} className="bg-white border border-slate-100 p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="flex items-center gap-8 w-full">
               <div className="w-20 h-24 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                 {p.book?.thumbnail_path ? <img src={supabase.storage.from('books_public').getPublicUrl(p.book.thumbnail_path).data.publicUrl} className="w-full h-full object-cover" /> : <CreditCard size={32} className="text-slate-200" />}
               </div>
               <div className="space-y-2">
                 <div className="text-obsidian font-bold text-2xl uppercase tracking-tight leading-none">{p.book?.title}</div>
                 <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</span>
                   <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${p.payment_status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-600'}`}>
                     {p.payment_status}
                   </span>
                 </div>
               </div>
            </div>
            {p.payment_status === 'pending' && (
              <div className="flex gap-4 mt-8 md:mt-0 w-full md:w-auto">
                <button onClick={() => updateStatus(p.id, 'completed')} className="flex-1 md:flex-none px-8 py-4 bg-emerald-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/10">Approve</button>
                <button onClick={() => updateStatus(p.id, 'failed')} className="flex-1 md:flex-none px-8 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="add-book" element={<AddBookPage />} />
      <Route path="books" element={<ManageBooks />} />
      <Route path="purchases" element={<ManagePurchases />} />
    </Routes>
  );
};

export default Admin;
