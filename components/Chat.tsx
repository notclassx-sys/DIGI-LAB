
import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Message } from '../types';
import { MessageSquare, Send, X, User as UserIcon, ShieldCheck, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion to any to bypass broken property types in the current environment
const m = motion as any;

interface ChatProps {
  user: User;
  isAdmin: boolean;
}

const Chat: React.FC<ChatProps> = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [activeChats, setActiveChats] = useState<{user_id: string, email: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const channel = supabase.channel('realtime_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        setMessages(prev => [...prev, msg]);
      })
      .subscribe();
    fetchMessages();
    if (isAdmin) fetchActiveChats();
    return () => { supabase.removeChannel(channel); };
  }, [isOpen, selectedChatUser]);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const fetchMessages = async () => {
    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (isAdmin) {
      if (selectedChatUser) query = query.or(`sender_id.eq.${selectedChatUser},recipient_id.eq.${selectedChatUser}`);
      else { setMessages([]); return; }
    } else query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
    const { data } = await query;
    if (data) setMessages(data);
  };

  const fetchActiveChats = async () => {
    const { data } = await supabase.from('messages').select('sender_id, sender_email').not('is_admin', 'eq', true);
    if (data) {
      const unique = Array.from(new Set(data.map(d => d.sender_id))).map(id => ({
        user_id: id, email: data.find(d => d.sender_id === id)?.sender_email || 'Unknown'
      }));
      setActiveChats(unique);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgData: any = { sender_id: user.id, sender_email: user.email, content: newMessage, is_admin: isAdmin };
    if (isAdmin && selectedChatUser) msgData.recipient_id = selectedChatUser;
    else if (!isAdmin) msgData.recipient_id = 'SYSTEM';
    await supabase.from('messages').insert(msgData);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {!isOpen ? (
          <m.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 green-gradient rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30 group"
          >
            <Headset size={30} className="group-hover:rotate-12 transition-transform" />
          </m.button>
        ) : (
          <m.div 
            initial={{ scale: 0.9, opacity: 0, y: 20, transformOrigin: 'bottom right' }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white border border-gray-100 w-80 md:w-[400px] h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 bg-gray-900 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl green-gradient flex items-center justify-center shadow-lg">
                  {isAdmin ? <ShieldCheck size={22} /> : <Headset size={22} />}
                </div>
                <div>
                  <p className="font-bold text-sm tracking-tight leading-none">
                    {isAdmin ? (selectedChatUser ? `Session: ${selectedChatUser.slice(0, 8)}` : 'Client Requests') : 'Concierge Support'}
                  </p>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1">Live Sanctuary</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow flex overflow-hidden bg-gray-50/50">
              {isAdmin && !selectedChatUser ? (
                <div className="w-full overflow-y-auto p-4 space-y-2">
                  <p className="text-[10px] text-gray-400 uppercase p-2 tracking-widest font-bold">Active Conversations</p>
                  {activeChats.map(c => (
                    <button 
                      key={c.user_id} 
                      onClick={() => setSelectedChatUser(c.user_id)}
                      className="w-full text-left p-4 hover:bg-white bg-white/50 border border-transparent hover:border-green-100 rounded-2xl transition-all shadow-sm text-xs font-bold text-gray-700"
                    >
                      {c.email}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col">
                  {isAdmin && (
                    <button onClick={() => setSelectedChatUser(null)} className="text-[10px] p-2 bg-white text-gray-400 hover:text-green-600 text-center border-b border-gray-100 font-bold uppercase tracking-widest">
                      ← Client Roster
                    </button>
                  )}
                  <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && !isAdmin && (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-green-500 shadow-sm">
                          <MessageSquare size={20} />
                        </div>
                        <p className="text-xs text-gray-400 font-medium px-10 leading-relaxed">How can our concierge assist you today, visionary?</p>
                      </div>
                    )}
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-3xl text-xs shadow-sm font-medium ${
                          m.sender_id === user.id 
                            ? 'bg-green-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={sendMessage} className="p-5 bg-white border-t border-gray-100 flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Compose query..." 
                      className="flex-grow bg-gray-50 text-gray-900 p-4 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-green-500/20 border border-gray-100 font-medium"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="p-4 green-gradient text-white rounded-2xl shadow-xl shadow-green-500/20">
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;