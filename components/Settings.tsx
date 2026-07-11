import React from 'react';
import { useActiveClass } from '../store/useStore';
import { playSound } from '../lib/audio';
import { 
  Settings as SettIcon, 
  Volume2, 
  VolumeX, 
  Zap, 
  Sparkles, 
  Trash2, 
  UserCheck2,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, resetRound, resetAll, students } = useActiveClass();

  const handleToggleSound = () => {
    const nextSound = !settings.soundEnabled;
    updateSettings({ soundEnabled: nextSound });
    playSound.click(nextSound);
  };

  const handleToggleConfetti = () => {
    playSound.click(settings.soundEnabled);
    updateSettings({ confettiEnabled: !settings.confettiEnabled });
  };

  const handleToggleVoice = () => {
    playSound.click(settings.soundEnabled);
    updateSettings({ voiceAnnouncement: !settings.voiceAnnouncement });
  };

  const handleSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    playSound.click(settings.soundEnabled);
    updateSettings({ drawSpeed: speed });
  };

  const handleAutoRemove = () => {
    playSound.click(settings.soundEnabled);
    updateSettings({ autoRemoveSelected: !settings.autoRemoveSelected });
  };

  const toggleFullscreen = () => {
    playSound.click(settings.soundEnabled);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <SettIcon className="w-8 h-8 text-slate-500 animate-spin-slow" />
          <span>ClassArena Preferences Settings</span>
        </h2>
        <p className="text-slate-500 font-semibold text-sm mt-1">
          Customize lottery speeds, audio synthesized elements, presentation displays, and reset databases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Audio & Speeds Preferences */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-md space-y-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-500" />
            <span>Interactive Elements</span>
          </h3>

          <div className="space-y-4">
            
            {/* Sound Toggle */}
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="block font-extrabold text-sm text-slate-700">Sound Effects Synthesizer</span>
                <span className="text-xs text-slate-400 font-semibold">Play plucks, sparkles, fanfares</span>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div 
                  className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${
                    settings.soundEnabled ? 'left-7' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {/* Confetti Toggle */}
            <div className="flex justify-between items-center py-2 border-t border-slate-100">
              <div>
                <span className="block font-extrabold text-sm text-slate-700">Winner Confetti Celebrations</span>
                <span className="text-xs text-slate-400 font-semibold">Burst confetti loops on reveals</span>
              </div>
              <button
                onClick={handleToggleConfetti}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  settings.confettiEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div 
                  className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${
                    settings.confettiEnabled ? 'left-7' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {/* Speeds Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div>
                <span className="block font-extrabold text-sm text-slate-700">Draw Shuffling Speed</span>
                <span className="text-xs text-slate-400 font-semibold">Time duration of lottery cards flying</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
                {(['slow', 'normal', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`py-2 text-center text-xs font-black uppercase rounded-lg transition-all ${
                      settings.drawSpeed === spd 
                        ? 'bg-white text-slate-800 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Presenter Mode & Maintenance */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-md space-y-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-pink-500" />
            <span>Screen Layout & Roster Actions</span>
          </h3>

          <div className="space-y-4">
            
            {/* Auto Remove Drawn */}
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="block font-extrabold text-sm text-slate-700">Auto Remove Drawn Students</span>
                <span className="text-xs text-slate-400 font-semibold">Ensure a student is selected only once per round</span>
              </div>
              <button
                onClick={handleAutoRemove}
                className={`w-14 h-8 rounded-full transition-all relative ${
                  settings.autoRemoveSelected ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <div 
                  className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-all ${
                    settings.autoRemoveSelected ? 'left-7' : 'left-1'
                  }`} 
                />
              </button>
            </div>

            {/* Toggle Fullscreen */}
            <div className="flex justify-between items-center py-2 border-t border-slate-100">
              <div>
                <span className="block font-extrabold text-sm text-slate-700">Fullscreen Presentation Mode</span>
                <span className="text-xs text-slate-400 font-semibold">Maximize for classroom projectors</span>
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>TOGGLE</span>
              </button>
            </div>

            {/* Danger Zone Actions */}
            <div className="pt-4 border-t border-rose-100 space-y-3">
              <span className="block text-xs font-black text-rose-500 uppercase tracking-widest">Database Operations</span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    playSound.click(settings.soundEnabled);
                    resetRound();
                    playSound.sparkle(settings.soundEnabled);
                  }}
                  className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold text-xs rounded-xl transition-all"
                >
                  Reset Draw Pool
                </button>
                <button
                  onClick={() => {
                    playSound.click(settings.soundEnabled);
                    if (confirm('Are you sure you want to delete all students?')) {
                      resetAll();
                      playSound.winner(settings.soundEnabled);
                    }
                  }}
                  className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl transition-all"
                >
                  Clear All Data
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
