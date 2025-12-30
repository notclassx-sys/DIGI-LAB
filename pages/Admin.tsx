
import React, { useState, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { Routes, Route, Link, useNavigate } = RRD as any;
import { supabase } from '../supabaseClient';
import { Book, Purchase } from '../types';
import { 
  Plus, Trash2, Edit3, CreditCard, CheckCircle, XCircle, 
  Book as BookIcon, Package, Upload, Loader2, Save, X, ArrowLeft, PlusCircle, AlertTriangle, ShieldCheck as Shield, Image as ImageIcon
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
    <div className="space-y-12 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Catalog', val: stats.books, icon: BookIcon, col: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Revenue Units', val: stats.sales, icon: Package, col: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Awaiting Verification', val: stats.pending, icon: CreditCard, col: 'text-orange-500', bg: 'bg-orange-50' }
        ].map((stat, i) => (
          <m.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 ${stat.bg} ${stat.col} rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-4xl font-serif font-bold text-gray-900">{stat.val}</p>
          </m.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white/50 border border-slate-100 rounded-[2.5rem] w-full md:w-fit backdrop-blur-sm">
        <Link to="add-book" className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-emerald-900 transition-all font-black text-xs uppercase tracking-widest">
          <PlusCircle size={18} className="text-[#d4af37]" />
          Add New Book
        </Link>
        <Link to="books" className="px-8 py-4 rounded-2xl bg-white text-slate-900 shadow-sm hover:bg-slate-50 transition-all font-black text-xs border border-slate-100 uppercase tracking-widest">Manage Catalog</Link>
        <Link to="purchases" className="px-8 py-4 rounded-2xl bg-white text-slate-900 shadow-sm hover:bg-slate-50 transition-all font-black text-xs border border-slate-100 uppercase tracking-widest">Verify Payments</Link>
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
    setErrorMsg(null);
    if (!pdfFile || !thumbFile) {
      setErrorMsg("Both manuscript (PDF) and thumbnail (Image) are required.");
      return;
    }
    setLoading(true);

    try {
      // 1. Upload Thumbnail to PUBLIC bucket (so users can see it without signed URL)
      const thumbName = `thumb-${Date.now()}-${thumbFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from('books_public')
        .upload(thumbName, thumbFile);
      if (thumbError) throw thumbError;

      // 2. Upload PDF to PRIVATE bucket
      const pdfName = `pdf-${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from('books_private')
        .upload(pdfName, pdfFile);
      if (pdfError) throw pdfError;

      // 3. Save to DB
      const { error: insertError } = await supabase.from('books').insert({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        pdf_path: pdfData.path,
        thumbnail_path: thumbData.path
      });

      if (insertError) throw insertError;

      alert("Manuscript published successfully.");
      navigate('/admin/books');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Archival protocol failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-3 bg-white rounded-2xl border border-slate-100 text-slate-400 hover:text-slate-900 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Archival Protocol</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-[#d4af37] mt-1">Expansion of the Digital Sanctuary</p>
        </div>
      </div>

      <m.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl space-y-10"
      >
        <AnimatePresence>
          {errorMsg && (
            <m.div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
              <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <p className="text-red-800 font-bold text-sm uppercase tracking-wider">System Conflict</p>
                <p className="text-red-600 text-xs italic">{errorMsg}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Book Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-slate-50 text-slate-900 p-5 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all font-bold"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Price (INR)</label>
            <input 
              type="number" 
              required
              className="w-full bg-slate-50 text-slate-900 p-5 rounded-2xl outline-none border border-transparent focus:border-emerald-500 transition-all font-bold"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
          <textarea 
            required
            className="w-full bg-slate-50 text-slate-900 p-6 rounded-[2rem] outline-none border border-transparent focus:border-emerald-500 transition-all h-32 font-medium italic"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Thumbnail (Image)</label>
            <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer transition-all">
              <ImageIcon className="text-slate-300 mb-2" size={24} />
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-full px-4">
                {thumbFile ? thumbFile.name : "Select Image"}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={e => setThumbFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Manuscript (PDF)</label>
            <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer transition-all">
              <Upload className="text-slate-300 mb-2" size={24} />
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-full px-4">
                {pdfFile ? pdfFile.name : "Select PDF"}
              </span>
              <input type="file" className="hidden" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-6 rounded-[2rem] bg-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-emerald-950 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Shield size={18} className="text-[#d4af37]" /> Publish Collection</>}
        </button>
      </m.form>
    </div>
  );
};

const ManageBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (data) setBooks(data);
    setLoading(false);
  };

  const deleteBook = async (book: Book) => {
    if (!confirm('Permanent deletion from the archive. Proceed?')) return;
    await supabase.from('books').delete().eq('id', book.id);
    if (book.pdf_path) await supabase.storage.from('books_private').remove([book.pdf_path]);
    if (book.thumbnail_path) await supabase.storage.from('books_public').remove([book.thumbnail_path]);
    fetchBooks();
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-serif font-bold text-slate-900">Archive Management</h2>
        <Link to="/admin/add-book" className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">New Manuscript</Link>
      </div>
      <div className="grid gap-4">
        {books.map(book => (
          <div key={book.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {book.thumbnail_path ? (
                <img src={supabase.storage.from('books_public').getPublicUrl(book.thumbnail_path).data.publicUrl} className="w-16 h-20 object-cover rounded-xl shadow-sm" />
              ) : (
                <div className="w-16 h-20 bg-slate-50 rounded-xl flex items-center justify-center"><BookIcon className="text-slate-200" /></div>
              )}
              <div>
                <div className="font-bold text-slate-900 text-lg">{book.title}</div>
                <div className="text-emerald-700 font-bold text-sm">₹{book.price}</div>
              </div>
            </div>
            <button onClick={() => deleteBook(book)} className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManagePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPurchases(); }, []);

  const fetchPurchases = async () => {
    const { data } = await supabase.from('purchases').select('*, book:books(*)').order('created_at', { ascending: false });
    if (data) setPurchases(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('purchases').update({ payment_status: status }).eq('id', id);
    fetchPurchases();
  };

  return (
    <div className="space-y-12 pb-20">
      <h2 className="text-4xl font-serif font-bold text-slate-900">Payment Verification</h2>
      <div className="grid gap-6">
        {purchases.map(p => (
          <div key={p.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="flex items-center gap-6 w-full">
               <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                 {p.book?.thumbnail_path ? <img src={supabase.storage.from('books_public').getPublicUrl(p.book.thumbnail_path).data.publicUrl} className="w-full h-full object-cover" /> : <CreditCard />}
               </div>
               <div>
                 <div className="text-slate-900 font-bold text-xl">{p.book?.title}</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">{p.payment_status}</div>
               </div>
            </div>
            {p.payment_status === 'pending' && (
              <div className="flex gap-4 mt-6 md:mt-0">
                <button onClick={() => updateStatus(p.id, 'completed')} className="px-6 py-3 bg-emerald-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Approve</button>
                <button onClick={() => updateStatus(p.id, 'failed')} className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest">Deny</button>
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
