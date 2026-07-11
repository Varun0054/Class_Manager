import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, BookOpen, Clock, Calendar, Users, Activity, LogOut, ArrowRight, X } from 'lucide-react';
import { playSound } from '../lib/audio';

export default function TeacherDashboard() {
  const { teacherUser, classrooms, setAppView, setTeacherUser, openClassroom, createClassroom, deleteClassroom } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    section: '',
    semester: '',
    academicYear: '',
    description: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('classArenaTeacher');
    setTeacherUser(null);
    setAppView('auth');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createClassroom(formData);
    setShowCreateModal(false);
    setFormData({ name: '', department: '', section: '', semester: '', academicYear: '', description: '' });
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden pt-20 pb-24 px-4 md:px-8">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[100px] animate-blob-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-[100px] animate-blob-2" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/70 backdrop-blur-xl border border-white/50 p-8 rounded-[32px] shadow-sm">
          <div className="space-y-2">
            <span className="text-violet-600 font-extrabold uppercase tracking-widest text-sm">Teacher Dashboard</span>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Welcome back, {teacherUser?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-500 font-medium text-lg">Manage your classrooms and student engagements.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Class</span>
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-4 bg-white border border-slate-200 text-slate-600 font-extrabold rounded-2xl shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-violet-600" />
            <span>My Classes</span>
            <span className="ml-2 bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">{classrooms.length}</span>
          </h2>

          {classrooms.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-md border border-slate-200 border-dashed rounded-[32px] p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-2">No Classes Found</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">You haven't created any classes yet. Get started by creating your first classroom.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-slate-800 text-white font-extrabold rounded-xl shadow-lg hover:bg-slate-900 transition-colors"
              >
                Create Your First Class
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classrooms.map(c => (
                <div 
                  key={c.id} 
                  className="group bg-white rounded-[28px] p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between h-[320px]"
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-black text-violet-600 uppercase tracking-wider mb-1">{c.department || 'General'} • {c.semester || 'N/A'}</div>
                        <h3 className="text-2xl font-black text-slate-800 leading-tight">{c.name}</h3>
                        {c.section && <div className="text-sm font-bold text-slate-400 mt-1">Section {c.section}</div>}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-violet-600" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <Users className="w-3 h-3" /> Total Pool
                        </span>
                        <div className="text-lg font-bold text-slate-700">{c.students.length}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <Activity className="w-3 h-3" /> Draws
                        </span>
                        <div className="text-lg font-bold text-slate-700">{c.history.length}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <Calendar className="w-3 h-3" /> Created
                        </span>
                        <div className="text-sm font-semibold text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <Clock className="w-3 h-3" /> Last Open
                        </span>
                        <div className="text-sm font-semibold text-slate-600">{c.lastOpenedAt ? new Date(c.lastOpenedAt).toLocaleDateString() : 'Never'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-3 relative z-10">
                    <button 
                      onClick={() => openClassroom(c.id)}
                      className="flex-1 py-3 bg-slate-900 text-white font-extrabold rounded-xl hover:bg-violet-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Open Class</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm('Are you sure you want to delete this class?')) deleteClassroom(c.id)
                      }}
                      className="px-4 py-3 bg-red-50 text-red-600 font-extrabold rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 my-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Create New Class</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Class Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. Data Structures 101" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. Computer Science" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Section</label>
                  <input type="text" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. A" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Semester</label>
                  <input type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. Fall 2026" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Academic Year</label>
                  <input type="text" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 outline-none" placeholder="e.g. 2026-2027" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 px-4 py-3 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Short description about this class..." rows={3} />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 border border-slate-200 text-slate-600 font-extrabold rounded-xl hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-violet-600 text-white font-extrabold rounded-xl shadow-md hover:bg-violet-700">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
