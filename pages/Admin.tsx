
import React, { useState, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { Routes, Route, Link, useNavigate } = RRD as any;
import { supabase } from '../supabaseClient';
import { Book, Purchase } from '../types';
import { 
  Plus, Trash2, Edit3, CreditCard, CheckCircle, XCircle, 
  Book as BookIcon, Package, Upload, Loader2, Save, X, ArrowLeft, PlusCircle
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }
    setLoading(true);

    try {
      const fileName = `${Date.now()}-${pdfFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('books_private')
        .upload(fileName, pdfFile);
      
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('books').insert({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        pdf_path: uploadData.path
      });

      if (insertError) throw insertError;

      alert("Book successfully added to the private archive.");
      navigate('/admin/books');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
          <h2 className="text-4xl font-serif font-bold text-slate-900">Add New Manuscript</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-[#d4af37] mt-1">Expansion of the Digital Sanctuary</p>
        </div>
      </div>

      <m.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl space-y-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Book Name</label>
            <input 
              type="text" 
              placeholder="The Art of Strategy..." 
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
              placeholder="2999" 
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
            placeholder="Describe the intellectual value of this book..." 
            required
            className="w-full bg-slate-50 text-slate-900 p-6 rounded-[2rem] outline-none border border-transparent focus:border-emerald-500 transition-all h-48 font-medium italic"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Manuscript File (PDF)</label>
          <label className="group flex flex-col items-center justify-center w-full p-16 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center text-slate-300 group-hover:text-emerald-600 shadow-sm transition-all mb-4">
              <Upload size={24} />
            </div>
            <span className="text-slate-500 font-bold text-sm tracking-tight text-center">
              {pdfFile ? (
                <span className="text-emerald-700">{pdfFile.name}</span>
              ) : (
                "Drop your PDF here or click to browse secure storage"
              )}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="application/pdf"
              onChange={e => setPdfFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-6 rounded-[2rem] bg-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:bg-emerald-950 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Save size={18} className="text-[#d4af37]" />
              Publish to Private Archive
            </>
          )}
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

  const deleteBook = async (id: string, path: string) => {
    if (!confirm('Permanent deletion from the archive. Proceed?')) return;
    await supabase.from('books').delete().eq('id', id);
    await supabase.storage.from('books_private').remove([path]);
    fetchBooks();
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Archive Management</h2>
          <p className="text-[10px] uppercase tracking-widest font-black text-[#d4af37] mt-1">Curating the Elite Collection</p>
        </div>
        <Link 
          to="/admin/add-book" 
          className="flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} /> New Manuscript
        </Link>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400">
                <th className="p-8 font-black uppercase tracking-widest text-[9px]">Title & Context</th>
                <th className="p-8 font-black uppercase tracking-widest text-[9px]">Unit Price</th>
                <th className="p-8 font-black uppercase tracking-widest text-[9px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {books.map(book => (
                <tr key={book.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="p-8">
                    <div className="font-bold text-slate-900 text-xl mb-2">{book.title}</div>
                    <div className="text-xs text-slate-400 line-clamp-1 max-w-xl font-medium italic">{book.description}</div>
                  </td>
                  <td className="p-8 text-slate-900 font-extrabold text-lg">₹{book.price}</td>
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => deleteBook(book.id, book.pdf_path)} 
                      className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Remove from Archive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">
                    The Archive is currently empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
      <div>
        <h2 className="text-4xl font-serif font-bold text-slate-900">Payment Verification</h2>
        <p className="text-[10px] uppercase tracking-widest font-black text-[#d4af37] mt-1">Reader Access Clearance</p>
      </div>
      
      <div className="grid gap-6">
        {purchases.map((p, idx) => (
          <m.div 
            key={p.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-6 w-full">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-emerald-800 shadow-inner border border-slate-100">
                <CreditCard size={28} />
              </div>
              <div className="space-y-1.5">
                <div className="text-slate-900 font-bold text-xl">{p.book?.title}</div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Identity: {p.user_id.slice(0, 8)}...</span>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase font-black tracking-widest ${
                    p.payment_status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                    p.payment_status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {p.payment_status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8 md:mt-0 w-full md:w-auto">
              {p.payment_status === 'pending' && (
                <>
                  <button 
                    onClick={() => updateStatus(p.id, 'completed')}
                    className="flex-grow md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-2xl hover:bg-emerald-950 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10"
                  >
                    <CheckCircle size={16} /> Approve Access
                  </button>
                  <button 
                    onClick={() => updateStatus(p.id, 'failed')}
                    className="flex-grow md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 text-red-500 rounded-2xl hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest border border-slate-100"
                  >
                    <XCircle size={16} /> Deny
                  </button>
                </>
              )}
            </div>
          </m.div>
        ))}
        {purchases.length === 0 && !loading && (
          <div className="text-center py-32 text-slate-300 font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[3rem]">
            No pending transactions awaiting clearance
          </div>
        )}
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
