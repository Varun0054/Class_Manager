import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogIn, Sparkles } from 'lucide-react';

import { account } from '../lib/appwrite';

export default function AuthPlaceholder() {
  const { setTeacherUser, setAppView, hydrateFromCloud } = useStore();
  const [name, setName] = useState('Prof. Harrison');
  const [email, setEmail] = useState('harrison@university.edu');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let userId = '';
      // Try to get existing session
      try {
        const currentUser = await account.get();
        userId = currentUser.$id;
      } catch (err) {
        // Create new anonymous session if none exists
        const session = await account.createAnonymousSession();
        userId = session.userId;
      }

      const user = {
        id: userId, // Real Appwrite User ID
        name,
        email
      };
      
      localStorage.setItem('classArenaTeacher', JSON.stringify(user));
      setTeacherUser(user);
      setAppView('teacher-dashboard');
      hydrateFromCloud(); // Hydrate immediately after login
      
    } catch (error) {
      console.error('Authentication Error:', error);
      alert('Failed to connect to Appwrite Authentication. Please check your console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[100px] animate-blob-1" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-300/30 rounded-full blur-[100px] animate-blob-2" />
      
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 rounded-[32px] shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-2 mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ClassArena</h1>
          <p className="text-slate-500 font-medium">Classroom Management Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Teacher Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>ENTER PLATFORM</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-slate-400">
          This is a simulated authentication step. 
          <br/>Data is stored securely in your local browser.
        </div>
      </div>
    </div>
  );
}
