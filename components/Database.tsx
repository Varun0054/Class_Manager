import React, { useState } from 'react';
import { useActiveClass } from '../store/useStore';
import { playSound } from '../lib/audio';
import { Search, Plus, Trash2, ShieldAlert, Filter, ArrowUpDown } from 'lucide-react';

export default function Database() {
  const { students, addStudent, deleteStudent, settings } = useActiveClass();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [secFilter, setSecFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Manual Add Form states
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [dept, setDept] = useState('');
  const [sec, setSec] = useState('');
  const [gender, setGender] = useState('Male');

  // Find unique filters
  const departments = ['All', ...Array.from(new Set(students.map(s => s.department)))];
  const sections = ['All', ...Array.from(new Set(students.map(s => s.section)))];

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roll) return;
    playSound.click(settings.soundEnabled);
    addStudent({
      name,
      rollNumber: roll,
      department: dept || 'Computer Science',
      section: sec || 'A',
      gender
    });
    setName('');
    setRoll('');
    setDept('');
    setSec('');
    setIsAdding(false);
    playSound.sparkle(settings.soundEnabled);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    const matchesSec = secFilter === 'All' || s.section === secFilter;
    const matchesGender = genderFilter === 'All' || s.gender === genderFilter;

    return matchesSearch && matchesDept && matchesSec && matchesGender;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Roster Database</h2>
          <p className="text-slate-500 font-semibold text-sm mt-1">
            Total of {students.length} students loaded. Search and edit records.
          </p>
        </div>
        
        <button
          onClick={() => {
            playSound.click(settings.soundEnabled);
            setIsAdding(!isAdding);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>ADD STUDENT</span>
        </button>
      </div>

      {/* manual Add Student Form */}
      {isAdding && (
        <form 
          onSubmit={handleAddStudent}
          className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] p-6 shadow-lg grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end"
        >
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Liam Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Roll Number</label>
            <input 
              type="text" 
              required
              placeholder="e.g. CS09"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Department</label>
            <input 
              type="text" 
              placeholder="e.g. Computer Science"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Section</label>
            <input 
              type="text" 
              placeholder="e.g. A"
              value={sec}
              onChange={(e) => setSec(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-slate-900 text-white font-extrabold text-sm rounded-xl hover:bg-slate-800 transition-all shadow-md"
          >
            Save Record
          </button>
        </form>
      )}

      {/* Filters Area */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-6 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Dept Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>
        </div>

        {/* Sec Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select 
            value={secFilter}
            onChange={(e) => setSecFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none"
          >
            {sections.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Sections' : `Section ${s}`}</option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select 
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

      </div>

      {/* Main Database Table Grid */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400">Roll No</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400">Student Name</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400">Department</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400">Section</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400">Points</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400 text-center">Status</th>
                <th className="px-6 py-4 font-black text-xs uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-sm text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 space-y-4">
                    <span className="text-5xl">🔍</span>
                    <p className="text-slate-400 font-bold">No students match current search filters</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-violet-600 font-bold">{s.rollNumber}</td>
                    <td className="px-6 py-4 font-black text-slate-800">{s.name}</td>
                    <td className="px-6 py-4">{s.department}</td>
                    <td className="px-6 py-4 text-center w-24">Class {s.section}</td>
                    <td className="px-6 py-4 font-black text-amber-600">{s.points} pts</td>
                    <td className="px-6 py-4 text-center">
                      {s.isSelected ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                          Drawn
                        </span>
                      ) : s.isSkipped ? (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                          Skipped
                        </span>
                      ) : (
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                          Pool
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          playSound.click(settings.soundEnabled);
                          deleteStudent(s.id);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
