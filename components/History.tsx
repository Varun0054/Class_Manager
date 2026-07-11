import React from 'react';
import { useActiveClass } from '../store/useStore';
import { playSound } from '../lib/audio';
import { History as HistIcon, Download, Undo, Clock, Sparkles } from 'lucide-react';

export default function History() {
  const { history, students, undoLastDraw, settings } = useActiveClass();

  const handleExportCSV = () => {
    playSound.click(settings.soundEnabled);
    if (history.length === 0) return;

    // Build CSV content
    const headers = 'Timestamp,Activity,Draw Mode,Selected Roll Numbers,Selected Names\n';
    const rows = history.map((item) => {
      const selectedNames = item.selectedStudentIds
        .map(id => students.find(s => s.id === id)?.name || 'Unknown')
        .join('; ');
      
      const selectedRolls = item.selectedStudentIds
        .map(id => students.find(s => s.id === id)?.rollNumber || 'Unknown')
        .join('; ');

      return `"${new Date(item.timestamp).toLocaleString()}","${item.activityName}","${item.mode}","${selectedRolls}","${selectedNames}"`;
    }).join('\n');

    const csvBlob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(csvBlob);
    link.setAttribute('download', `classarena-history-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSound.sparkle(settings.soundEnabled);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <HistIcon className="w-8 h-8 text-emerald-500" />
            <span>Draw Session History Logs</span>
          </h2>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Browse all lottery selections, timestamps, and active modes in this session.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              playSound.click(settings.soundEnabled);
              undoLastDraw();
              playSound.sparkle(settings.soundEnabled);
            }}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
          >
            <Undo className="w-4 h-4" />
            <span>Undo Last Draw</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-xl space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <span className="text-5xl">📖</span>
            <p className="text-slate-400 font-black text-lg">No selection activity logged yet!</p>
            <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto">
              Whenever you execute a random draw from the Lottery Picker, logs will populate here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {history.map((item) => (
              <div 
                key={item.id}
                className="p-5 border border-slate-100 rounded-2xl bg-white/50 hover:bg-white/90 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-violet-100 text-violet-700 font-black uppercase px-2.5 py-1 rounded-full">
                      {item.activityName}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-500 font-extrabold uppercase px-2.5 py-1 rounded-full">
                      Mode: {item.mode}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.selectedStudentIds.map((id) => {
                      const student = students.find((s) => s.id === id);
                      return (
                        <span 
                          key={id}
                          className="text-xs font-extrabold bg-gradient-to-r from-slate-100 to-slate-200/50 text-slate-700 border border-slate-200/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3 text-pink-500" />
                          <span>{student ? student.name : 'Unknown'}</span>
                          <span className="text-[10px] text-slate-400 uppercase">({student ? student.rollNumber : '?'})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="text-slate-400 text-xs font-bold md:text-right shrink-0">
                  {new Date(item.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
