import React from 'react';
import { useStore, useActiveClass } from '../store/useStore';
import { 
  LayoutDashboard, 
  Dices, 
  Trophy, 
  Users, 
  Database as DbIcon, 
  BarChart3, 
  History as HistIcon, 
  Settings as SettIcon, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { playSound } from '../lib/audio';

export default function Navbar() {
  const { teacherUser, exitClassroom } = useStore();
  const { activeTab, setActiveTab, settings } = useActiveClass();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-500' },
    { id: 'lottery', label: 'Lottery Picker', icon: Dices, color: 'text-pink-500' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-amber-500' },
    { id: 'teams', label: 'Team Builder', icon: Users, color: 'text-cyan-500' },
    { id: 'database', label: 'Database', icon: DbIcon, color: 'text-teal-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-violet-500' },
    { id: 'history', label: 'Draw History', icon: HistIcon, color: 'text-emerald-500' },
    { id: 'settings', label: 'Settings', icon: SettIcon, color: 'text-slate-500' },
  ] as const;

  const handleTabChange = (tabId: typeof activeTab) => {
    playSound.click(settings.soundEnabled);
    setActiveTab(tabId);
  };

  const handleExit = () => {
    playSound.click(settings.soundEnabled);
    exitClassroom();
  };

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-[1400px]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.08)] rounded-[28px]">
        {/* Brand & Exit */}
        <div className="flex items-center gap-6">
          <button 
            onClick={handleExit}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Classes</span>
          </button>
          
          <div className="hidden lg:flex items-center gap-2 font-black text-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text text-transparent select-none">
            <Sparkles className="w-6 h-6 text-violet-600 animate-pulse" />
            <span>ClassArena</span>
          </div>
        </div>

        {/* Navigation Tabs - Added overflow-x-auto for smaller screens */}
        <div className="flex items-center gap-2 xl:gap-3 overflow-x-auto no-scrollbar px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-full text-base font-black whitespace-nowrap transition-all duration-300 relative group shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-violet-600/10 to-pink-600/10 text-violet-700 shadow-sm border border-violet-500/20' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="hidden xl:inline">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] bg-gradient-to-r from-violet-600 to-pink-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-slate-200 ml-2">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</span>
            <span className="text-sm font-black text-slate-800">{teacherUser?.name || 'Teacher'}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-md hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-slate-800 text-base select-none">
              {teacherUser?.name?.charAt(0) || 'T'}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
