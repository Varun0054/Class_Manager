import React, { useState } from 'react';
import { useActiveClass } from '../store/useStore';
import { playSound } from '../lib/audio';
import { Users, Sparkles, RefreshCw, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Teams() {
  const { students, teams, generateTeams, settings } = useActiveClass();
  const [teamCount, setTeamCount] = useState<number>(3);
  const [studentsPerTeam, setStudentsPerTeam] = useState<number>(4);
  const [mode, setMode] = useState<'count' | 'size'>('count');

  const handleGenerate = () => {
    if (students.length === 0) {
      alert('Roster is empty! Please upload Excel first.');
      return;
    }
    playSound.click(settings.soundEnabled);
    generateTeams(teamCount, studentsPerTeam, mode);
    playSound.winner(settings.soundEnabled);
    confetti({
      particleCount: 50,
      spread: 60,
      colors: ['#06b6d4', '#10b981', '#3b82f6']
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Users className="w-8 h-8 text-cyan-500 animate-bounce" />
          <span>Team Builder Generator</span>
        </h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">
          Instantly split your classroom roster into balanced, randomized teams for workshops, projects, and activities.
        </p>
      </div>

      {/* Control Panel */}
      <div className="max-w-2xl mx-auto bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-md space-y-6">
        
        {/* Toggle Mode */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              playSound.click(settings.soundEnabled);
              setMode('count');
            }}
            className={`flex-1 py-3 text-center font-extrabold text-sm rounded-xl transition-all ${
              mode === 'count' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Number of Teams
          </button>
          <button
            onClick={() => {
              playSound.click(settings.soundEnabled);
              setMode('size');
            }}
            className={`flex-1 py-3 text-center font-extrabold text-sm rounded-xl transition-all ${
              mode === 'size' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Students Per Team
          </button>
        </div>

        {/* Input sliders */}
        <div className="space-y-4">
          {mode === 'count' ? (
            <div className="space-y-2">
              <div className="flex justify-between font-black text-xs uppercase tracking-wider text-slate-400">
                <span>Create {teamCount} Teams</span>
                <span className="text-cyan-600">{Math.ceil(students.length / teamCount)} std/team avg</span>
              </div>
              <input 
                type="range" 
                min={2} 
                max={15} 
                value={teamCount}
                onChange={(e) => setTeamCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between font-black text-xs uppercase tracking-wider text-slate-400">
                <span>Set {studentsPerTeam} Students Per Team</span>
                <span className="text-cyan-600">{Math.ceil(students.length / studentsPerTeam)} teams total</span>
              </div>
              <input 
                type="range" 
                min={2} 
                max={20} 
                value={studentsPerTeam}
                onChange={(e) => setStudentsPerTeam(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold rounded-[20px] shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>GENERATE TEAMS NOW</span>
        </button>

      </div>

      {/* Generated Teams Grid */}
      {teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div 
              key={team.id}
              className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              {/* Team colored header bar */}
              <div 
                className="px-6 py-4 text-white font-black text-lg flex items-center justify-between"
                style={{ background: team.color }}
              >
                <span>{team.name}</span>
                <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-extrabold uppercase">
                  {team.studentIds.length} Members
                </span>
              </div>
              
              <div className="p-6 space-y-2 max-h-[250px] overflow-y-auto">
                {team.studentIds.map((id) => {
                  const student = students.find((s) => s.id === id);
                  if (!student) return null;
                  return (
                    <div key={id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="font-extrabold text-slate-700 text-sm">{student.name}</span>
                      <span className="text-[10px] bg-slate-100 font-extrabold text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider">
                        {student.rollNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty visual state */}
      {teams.length === 0 && (
        <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
          <div className="text-5xl">🎒</div>
          <h3 className="text-xl font-black text-slate-700">No Teams Generated</h3>
          <p className="text-slate-400 font-medium text-sm leading-relaxed">
            Choose your parameters and click Generate to divide the classroom roster!
          </p>
        </div>
      )}

    </div>
  );
}
