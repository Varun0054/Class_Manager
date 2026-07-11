import React from 'react';
import { useActiveClass } from '../store/useStore';
import { Trophy, Star, Plus, Minus, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { playSound } from '../lib/audio';

export default function Leaderboard() {
  const { students, updatePoints, settings } = useActiveClass();

  // Get sorted list of students
  const sortedList = [...students].sort((a, b) => b.points - a.points);
  
  // Top 3 Podium spots
  const gold = sortedList[0];
  const silver = sortedList[1];
  const bronze = sortedList[2];
  
  // The rest
  const listRest = sortedList.slice(3);

  const adjustScore = (id: string, amount: number) => {
    playSound.click(settings.soundEnabled);
    updatePoints(id, amount);
    if (amount > 0) {
      playSound.sparkle(settings.soundEnabled);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
          <span>Hall of Fame Leaderboard</span>
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          Award points to encourage participation! Watch rankings swap and animate instantly on the scoreboard.
        </p>
      </div>

      {/* Podiums (Top 3) */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 md:gap-12 pt-16">
        
        {/* Silver Medal Podium (Rank 2) */}
        {silver && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex flex-col items-center order-2 md:order-1"
          >
            <div className="relative mb-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center font-bold text-slate-800 text-lg shadow-md">
                🥈
              </div>
              <span className="mt-2 font-black text-slate-800 truncate w-28 text-center">{silver.name}</span>
              <span className="text-xs font-bold text-slate-400">{silver.department}</span>
            </div>
            {/* Podium Box */}
            <div className="w-32 h-28 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-[20px] shadow-lg border border-slate-200/50 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-500">{silver.points}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Points</span>
            </div>
          </motion.div>
        )}

        {/* Gold Medal Podium (Rank 1) */}
        {gold && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="flex flex-col items-center order-1 md:order-2 z-10 -mt-8"
          >
            <div className="relative mb-4 flex flex-col items-center">
              {/* Crown visual */}
              <div className="absolute top-[-30px] text-3xl animate-bounce">👑</div>
              <div className="w-20 h-20 rounded-full bg-amber-400 border-4 border-amber-500 flex items-center justify-center font-bold text-slate-900 text-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                🥇
              </div>
              <span className="mt-2 font-black text-slate-800 text-lg truncate w-36 text-center">{gold.name}</span>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">{gold.department}</span>
            </div>
            {/* Podium Box */}
            <div className="w-40 h-36 bg-gradient-to-t from-amber-400 to-amber-200 rounded-t-[24px] shadow-[0_10px_30px_-5px_rgba(245,158,11,0.3)] border border-amber-300 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-800">{gold.points}</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Points</span>
            </div>
          </motion.div>
        )}

        {/* Bronze Medal Podium (Rank 3) */}
        {bronze && (
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex flex-col items-center order-3"
          >
            <div className="relative mb-4 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-amber-700/20 border-4 border-amber-800/40 flex items-center justify-center font-bold text-slate-800 text-lg shadow-md">
                🥉
              </div>
              <span className="mt-2 font-black text-slate-800 truncate w-28 text-center">{bronze.name}</span>
              <span className="text-xs font-bold text-slate-400">{bronze.department}</span>
            </div>
            {/* Podium Box */}
            <div className="w-32 h-24 bg-gradient-to-t from-amber-800/10 to-amber-700/5 rounded-t-[20px] shadow-md border border-amber-800/10 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-amber-900">{bronze.points}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800/50">Points</span>
            </div>
          </motion.div>
        )}

      </div>

      {/* Rest of the list */}
      <div className="max-w-3xl mx-auto bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl">
        <h3 className="text-lg font-black text-slate-800 mb-4 px-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-violet-500" />
          <span>Full Scoreboard Ranks</span>
        </h3>

        {sortedList.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <span className="text-5xl">🏜</span>
            <p className="text-slate-400 font-semibold">No students in database to rank!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2">
            {sortedList.map((student, index) => (
              <div 
                key={student.id}
                className="flex items-center justify-between py-3.5 px-4 hover:bg-slate-50/50 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Rank circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    index === 0 ? 'bg-amber-400 text-slate-900' :
                    index === 1 ? 'bg-slate-200 text-slate-800' :
                    index === 2 ? 'bg-amber-800/20 text-amber-900' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-800 text-sm">{student.name}</div>
                    <div className="text-xs text-slate-400 font-semibold">
                      {student.rollNumber} • {student.department} • Sec {student.section}
                    </div>
                  </div>
                </div>

                {/* Live Counter & Adjustment tools */}
                <div className="flex items-center gap-4">
                  <span className="font-black text-lg text-slate-800 w-12 text-right">{student.points} pts</span>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => adjustScore(student.id, -1)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => adjustScore(student.id, 1)}
                      className="p-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
