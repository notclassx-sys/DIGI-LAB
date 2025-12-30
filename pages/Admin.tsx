
import React, { useState, useEffect } from 'react';
import * as RRD from 'react-router-dom';
const { Routes, Route, Link } = RRD as any;
import { supabase } from '../supabaseClient';
import { Book, Purchase } from '../types';
import { 
  Plus, Trash2, Edit3, CreditCard, CheckCircle, XCircle, 
  Book as BookIcon, Package, Upload, Loader2, Save, X 
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
    <div className="space-y-12">
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

      <div className="flex flex-wrap gap-4 p-2 bg-gray-100/50 rounded-2xl w-fit">
        <Link to="books" className="px-8 py-3 rounded-xl bg-white text-gray-900 shadow-sm hover:text-green-600 transition-all font-bold text-sm">Manage Catalog</Link>
        <Link to="purchases" className="px-8 py-3 rounded-xl hover:bg-white text-gray-500 hover:text-green-600 transition-all font-bold text-sm">Verify Payments</Link>
      </div>
    </div>
  );
};

const ManageBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isEditing, setIsEditing] = useState<Book | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: 0 });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (data) setBooks(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pdfPath = isEditing?.pdf_path || '';

      if (pdfFile) {
        const fileName = `${Date.now()}-${pdfFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('books_private')
          .upload(fileName, pdfFile);
        if (uploadError) throw uploadError;
        pdfPath = uploadData.path;
      }

      if (isEditing) {
        const { error } = await supabase.from('books').update({ ...formData, pdf_path: pdfPath }).eq('id', isEditing.id);
        if (error) throw error;
      } else {
        if (!pdfFile) throw new Error('PDF is mandatory for new books');
        const { error } = await supabase.from('books').insert({ ...formData, pdf_path: pdfPath });
        if (error) throw error;
      }

      setIsAdding(false);
      setIsEditing(null);
      setFormData({ title: '', description: '', price: 0 });
      setPdfFile(null);
      fetchBooks();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (id: string, path: string) => {
    if (!confirm('Permanent deletion. Proceed?')) return;
    await supabase.from('books').delete().eq('id', id);
    await supabase.storage.from('books_private').remove([path]);
    fetchBooks();
  };

  const startEdit = (book: Book) => {
    setIsEditing(book);
    setFormData({ title: book.title, description: book.description, price: book.price });
    setIsAdding(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Archive Management</h2>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ title: '', description: '', price: 0 }); }} 
          className="flex items-center gap-2 px-6 py-3 green-gradient text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 hover:scale-105 transition-all"
        >
          <Plus size={20} /> New Manuscript
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <m.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave} 
            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Book Title</label>
                <input 
                  type="text" 
                  placeholder="Mastering the Craft..." 
                  className="w-full bg-gray-50 text-gray-900 p-4 rounded-2xl outline-none border border-transparent focus:border-green-500 transition-all font-medium"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Value (INR)</label>
                <input 
                  type="number" 
                  placeholder="999" 
                  className="w-full bg-gray-50 text-gray-900 p-4 rounded-2xl outline-none border border-transparent focus:border-green-500 transition-all font-medium"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea 
                placeholder="Elaborate on the insights provided in this volume..." 
                className="w-full bg-gray-50 text-gray-900 p-4 rounded-2xl outline-none border border-transparent focus:border-green-500 transition-all h-32 font-medium"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <label className="flex-grow w-full flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all bg-gray-50 group">
                <Upload className="text-gray-300 mb-3 group-hover:text-green-500 transition-colors" size={32} />
                <span className="text-gray-500 text-sm font-bold">
                  {pdfFile ? pdfFile.name : (isEditing ? 'Upload Replacement PDF (Optional)' : 'Select Original PDF Manuscript')}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={e => setPdfFile(e.target.files?.[0] || null)}
                />
              </label>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-grow px-10 py-4 green-gradient text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-500/20"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {isEditing ? 'Update Archive' : 'Publish Title'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </m.form>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Title & Description</th>
                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Unit Price</th>
                <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {books.map(book => (
                <tr key={book.id} className="group hover:bg-gray-50/30 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-gray-900 text-lg mb-1">{book.title}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 max-w-md font-medium">{book.description}</div>
                  </td>
                  <td className="p-6 text-gray-900 font-bold">₹{book.price}</td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => startEdit(book)}
                      className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                      title="Refine Title"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteBook(book.id, book.pdf_path)} 
                      className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                      title="Remove from Archive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
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
    <div className="space-y-8">
      <h2 className="text-3xl font-serif font-bold text-gray-900">Payment Verification</h2>
      <div className="grid gap-6">
        {purchases.map((p, idx) => (
          <m.div 
            key={p.id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-gray-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-6 w-full">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-green-600 shadow-inner">
                <CreditCard size={32} />
              </div>
              <div className="space-y-1">
                <div className="text-gray-900 font-bold text-xl">{p.book?.title}</div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Reader ID: {p.user_id.slice(0, 12)}...</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black ${
                    p.payment_status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                    p.payment_status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {p.payment_status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0 w-full md:w-auto">
              {p.payment_status === 'pending' && (
                <>
                  <button 
                    onClick={() => updateStatus(p.id, 'completed')}
                    className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all font-bold shadow-sm"
                  >
                    <CheckCircle size={20} /> Verify
                  </button>
                  <button 
                    onClick={() => updateStatus(p.id, 'failed')}
                    className="flex-grow md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold shadow-sm"
                  >
                    <XCircle size={20} /> Decline
                  </button>
                </>
              )}
            </div>
          </m.div>
        ))}
        {purchases.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-300 font-bold uppercase tracking-widest">No pending transactions recorded</div>
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="books" element={<ManageBooks />} />
      <Route path="purchases" element={<ManagePurchases />} />
    </Routes>
  );
};

export default Admin;
