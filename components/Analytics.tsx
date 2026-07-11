import React from 'react';
import { useActiveClass } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, Star, Layers, Users } from 'lucide-react';

export default function Analytics() {
  const { students } = useActiveClass();

  const total = students.length;
  const drawnCount = students.filter(s => s.isSelected).length;
  const poolCount = students.filter(s => !s.isSelected).length;

  const totalPoints = students.reduce((sum, s) => sum + s.points, 0);
  const avgPoints = total ? (totalPoints / total).toFixed(1) : 0;

  // Chart data 1: Ratio of Pool vs Selected
  const ratioData = [
    { name: 'Drawn Roster', value: drawnCount, color: '#ec4899' },
    { name: 'Remaining Pool', value: poolCount, color: '#4F46E5' }
  ];

  // Chart data 2: Top scorers
  const topScorers = [...students]
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map(s => ({
      name: s.name,
      Points: s.points
    }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-violet-500" />
          <span>Classroom Analytics & Insights</span>
        </h2>
        <p className="text-slate-500 font-semibold text-sm mt-1">
          Review classroom engagement and active points metrics.
        </p>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 shrink-0">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Total MVPs Awarded</span>
            <span className="text-2xl font-black text-slate-800">{totalPoints} pts</span>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Average Points</span>
            <span className="text-2xl font-black text-slate-800">{avgPoints} pts</span>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-400 uppercase tracking-widest">Participation Rate</span>
            <span className="text-2xl font-black text-slate-800">
              {total ? ((drawnCount / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top 5 scorers Chart */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-md">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider text-xs text-slate-400">
            Top 5 Most Active Scorers
          </h3>
          <div className="h-64">
            {topScorers.length === 0 || topScorers.every(t => t.Points === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-sm">
                No active scores to show yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topScorers} margin={{ bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Points" fill="#7C3AED" radius={[10, 10, 0, 0]}>
                    {topScorers.map((entry, idx) => (
                      <Cell 
                        key={idx} 
                        fill={['#4F46E5', '#7C3AED', '#EC4899', '#06B6D4', '#10B981'][idx % 5]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Selected vs Pool Pie Chart */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-md">
          <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider text-xs text-slate-400">
            Roster Draw Ratios
          </h3>
          <div className="h-64 flex flex-col md:flex-row items-center justify-around">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ratioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 font-semibold text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ec4899]" />
                <span>Selected: {drawnCount} ({total ? ((drawnCount / total) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
                <span>Remaining Pool: {poolCount} ({total ? ((poolCount / total) * 100).toFixed(0) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
