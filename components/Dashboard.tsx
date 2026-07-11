import React, { useRef, useState, useEffect } from 'react';
import { useStore, useActiveClass } from '../store/useStore';
import { 
  Upload, 
  Users as UsersIcon, 
  Sparkles, 
  Trophy, 
  RefreshCw, 
  Timer,
  Play,
  UserCheck2,
  Layers,
  ArrowRight,
  Settings as SettingsIcon,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { playSound } from '../lib/audio';
import { Student } from '../types';

const FUZZY_MAPS: Record<string, string[]> = {
  name: ['studentname', 'name', 'studentfirstname', 'firstname', 'fullname', 'candidatename', 'username'],
  rollNumber: ['rollnumber', 'rollno', 'uid', 'prn', 'seatnumber', 'registrationnumber', 'studentid', 'id', 'serialno', 'enrollmentno'],
  department: ['department', 'dept', 'major', 'course', 'branch', 'stream'],
  section: ['section', 'sec', 'class', 'group', 'batch', 'division'],
  gender: ['gender', 'sex', 'mf'],
  semester: ['semester', 'sem']
};

function performFuzzyMatch(headers: string[], internalField: string): string {
  const targets = FUZZY_MAPS[internalField] || [];
  
  // Normalize and compare
  for (const header of headers) {
    const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const target of targets) {
      if (cleanHeader === target || cleanHeader.includes(target) || target.includes(cleanHeader)) {
        return header;
      }
    }
  }
  return '';
}

export default function Dashboard() {
  const { students, setStudents, settings, resetRound, setActiveTab, name: className, updateSettings } = useActiveClass();
  const { teacherUser } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard States
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<any[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({
    name: '',
    rollNumber: '',
    department: '',
    section: '',
    gender: '',
    semester: ''
  });
  const [showMappingWizard, setShowMappingWizard] = useState(false);

  // Stats calculation
  const totalCount = students.length;
  const selectedCount = students.filter(s => s.isSelected).length;
  const remainingCount = students.filter(s => !s.isSelected && !s.isSkipped).length;
  const leader = [...students].sort((a, b) => b.points - a.points)[0];
  
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleExcelUpload = (file: File) => {
    playSound.click(settings.soundEnabled);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<any>(sheet);

        if (rows.length === 0) {
          alert('Spreadsheet is empty.');
          return;
        }

        // Get headers from first row keys
        const headers = Object.keys(rows[0]);
        setExcelHeaders(headers);
        setExcelRows(rows);
        setCurrentFileName(file.name);

        // Run fuzzy match or use existing mapping from settings
        const suggested: Record<string, string> = { ...settings.importMappings };
        
        Object.keys(FUZZY_MAPS).forEach((key) => {
          if (!suggested[key] || !headers.includes(suggested[key])) {
            suggested[key] = performFuzzyMatch(headers, key);
          }
        });

        setColumnMappings(suggested);
        setShowMappingWizard(true);
        playSound.sparkle(settings.soundEnabled);
      } catch (error) {
        alert('Failed to read Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    playSound.click(settings.soundEnabled);

    // Make sure we have a Name column mapped
    if (!columnMappings.name) {
      alert('You must map the Student Name field before proceeding!');
      return;
    }

    const mappedStudents: Student[] = excelRows.map((row, idx) => {
      const nameVal = row[columnMappings.name];
      const rollVal = columnMappings.rollNumber ? row[columnMappings.rollNumber] : `ROLL-${idx + 101}`;
      const deptVal = columnMappings.department ? row[columnMappings.department] : 'General';
      const secVal = columnMappings.section ? row[columnMappings.section] : 'A';
      const genderVal = columnMappings.gender ? row[columnMappings.gender] : 'Not Specified';

      return {
        id: crypto.randomUUID(),
        rollNumber: String(rollVal || `ROLL-${idx + 101}`),
        name: String(nameVal || `Student ${idx + 1}`),
        gender: String(genderVal || 'Not Specified'),
        department: String(deptVal || 'General'),
        section: String(secVal || 'A'),
        points: 0,
        drawCount: 0,
        isSelected: false,
        isSkipped: false
      };
    });

    setStudents(mappedStudents);
    setShowMappingWizard(false);
    playSound.winner(settings.soundEnabled);
    
    // Save mapping and import log
    const importLog = {
      filename: currentFileName,
      importedBy: teacherUser?.name || 'Teacher',
      date: new Date().toISOString(),
      studentCount: mappedStudents.length,
      duplicateRowsRemoved: 0,
      invalidRows: 0
    };

    updateSettings({
      importMappings: columnMappings,
      importHistory: [importLog, ...(settings.importHistory || [])].slice(0, 50) // Keep last 50
    });

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx')) {
        handleExcelUpload(file);
      } else {
        alert('Please drop an Excel (.xlsx) file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleExcelUpload(e.target.files[0]);
    }
  };

  const triggerUploadClick = () => {
    playSound.click(settings.soundEnabled);
    fileInputRef.current?.click();
  };

  // Generate mapping preview rows
  const previewRows = excelRows.slice(0, 10).map((row, idx) => {
    const nameVal = columnMappings.name ? row[columnMappings.name] : `Student ${idx + 1}`;
    const rollVal = columnMappings.rollNumber ? row[columnMappings.rollNumber] : `ROLL-${idx + 101}`;
    const deptVal = columnMappings.department ? row[columnMappings.department] : 'General';
    const secVal = columnMappings.section ? row[columnMappings.section] : 'A';
    return { nameVal, rollVal, deptVal, secVal };
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Interactive Mapping Wizard Overlay Modal */}
      {showMappingWizard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-4xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 my-8">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-violet-600 animate-spin-slow" />
                <h2 className="text-2xl font-black text-slate-800">Map Roster Columns</h2>
              </div>
              <button 
                onClick={() => setShowMappingWizard(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="text-sm text-slate-500 font-semibold leading-relaxed bg-violet-50/50 p-4 border border-violet-100 rounded-2xl">
              🎯 We've automatically auto-detected mappings using fuzzy matching! You can adjust them below. 
              Only <strong>Student Name</strong> is strictly required. Unmapped optional fields default to clean values.
            </div>

            {/* Mapping Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'name', label: 'Student Name *', desc: 'Used for selection displays' },
                { key: 'rollNumber', label: 'Roll Number (Optional)', desc: 'ID, UID, PRN or Seat No' },
                { key: 'department', label: 'Department (Optional)', desc: 'Branch, Course or Major' },
                { key: 'section', label: 'Section (Optional)', desc: 'Class division or Group' },
                { key: 'gender', label: 'Gender (Optional)', desc: 'Male, Female, Other' },
              ].map((field) => (
                <div key={field.key} className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                    <span className="block text-[11px] text-slate-400 font-semibold">{field.desc}</span>
                  </div>
                  
                  <select
                    value={columnMappings[field.key]}
                    onChange={(e) => setColumnMappings({ ...columnMappings, [field.key]: e.target.value })}
                    className="w-full bg-white px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">-- Skip / Optional --</option>
                    {excelHeaders.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Interactive Preview Table */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Preview of First 10 Records</span>
              <div className="border border-slate-100 rounded-[20px] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-2.5 font-black text-slate-400">Roll No</th>
                      <th className="px-4 py-2.5 font-black text-slate-400">Student Name</th>
                      <th className="px-4 py-2.5 font-black text-slate-400">Department</th>
                      <th className="px-4 py-2.5 font-black text-slate-400">Section</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-slate-600">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 text-violet-600">{String(r.rollVal)}</td>
                        <td className="px-4 py-2.5 font-black text-slate-700">{String(r.nameVal)}</td>
                        <td className="px-4 py-2.5">{String(r.deptVal)}</td>
                        <td className="px-4 py-2.5">Class {String(r.secVal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wizard actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setShowMappingWizard(false)}
                className="px-6 py-3 border border-slate-200 text-slate-600 font-extrabold text-sm rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              
              <button 
                onClick={confirmImport}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                Import {excelRows.length} Students
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-grid-white/[0.08] [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative space-y-2">
          <span className="bg-white/20 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-md border border-white/20 tracking-wider">
            {className || 'Class Dashboard'}
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Welcome, {teacherUser?.name?.split(' ')[0] || 'Prof'}! 🎮
          </h1>
          <p className="text-white/80 max-w-xl text-lg font-medium">
            Make today's classroom draw legendary. Hook up your projector, crank the audio, and start selecting champions!
          </p>
        </div>
        <button
          onClick={() => {
            playSound.click(settings.soundEnabled);
            setActiveTab('lottery');
          }}
          className="relative group bg-white text-violet-700 font-extrabold rounded-[20px] px-8 py-4 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 overflow-hidden shrink-0"
        >
          <Play className="w-5 h-5 fill-violet-700 stroke-none" />
          <span>START DRAW ROUND</span>
        </button>
      </div>

      {/* Grid of Dynamic Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Students Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[28px] p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-20 group-hover:scale-110 transition-transform duration-300">
            <UsersIcon className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-white/80 font-bold uppercase text-xs tracking-wider">📚 Total Roster</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <UsersIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-5xl font-black">{totalCount}</div>
            <p className="text-white/70 text-sm mt-1 font-semibold">Active participants loaded</p>
          </div>
        </div>

        {/* Selected / Remaining Card */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[28px] p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-20 group-hover:scale-110 transition-transform duration-300">
            <UserCheck2 className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-white/80 font-bold uppercase text-xs tracking-wider">🎯 Selection Ratio</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <UserCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-4">
            <div className="text-5xl font-black">{selectedCount}</div>
            <div className="text-lg font-bold text-white/80">/ {totalCount} Drawn</div>
          </div>
          <div className="mt-2 w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500" 
              style={{ width: `${totalCount ? (selectedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <p className="text-white/70 text-xs mt-2 font-semibold">{remainingCount} students remaining in pool</p>
        </div>

        {/* Current Leader / Top Points Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[28px] p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] opacity-20 group-hover:scale-110 transition-transform duration-300">
            <Trophy className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <span className="text-white/80 font-bold uppercase text-xs tracking-wider">🏆 Leaderboard MVP</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black truncate">{leader ? leader.name : 'No Leader'}</div>
            <p className="text-white/70 text-sm mt-1 font-semibold">
              {leader ? `${leader.points} MVP points earned (${leader.department})` : 'Import roster to begin'}
            </p>
          </div>
        </div>

        {/* Live Timer Widget */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-[28px] p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">⏱ Clock Tower</span>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{currentTime || '10:00:00 AM'}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[2px] flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
              <Timer className="w-5 h-5 text-cyan-600 animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* Quick Reset Draw Widget */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-[28px] p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">🔄 Reset Roster</span>
            <div className="text-sm font-semibold text-slate-500">Put all selected back to pool</div>
          </div>
          <button 
            onClick={() => {
              playSound.click(settings.soundEnabled);
              resetRound();
              playSound.sparkle(settings.soundEnabled);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RESET POOL</span>
          </button>
        </div>

        {/* Quick Database View Widget */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-[28px] p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-300">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">⚡ Database</span>
            <div className="text-sm font-semibold text-slate-500">Manage all class information</div>
          </div>
          <button 
            onClick={() => {
              playSound.click(settings.soundEnabled);
              setActiveTab('database');
            }}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-xs tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Layers className="w-4 h-4" />
            <span>VIEW ROSTER</span>
          </button>
        </div>

      </div>

      {/* Upload Zone & Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Excel Dropzone */}
        <div 
          className={`flex flex-col items-center justify-center p-12 border-4 border-dashed rounded-[32px] transition-all duration-300 ${
            dragActive 
              ? 'border-violet-500 bg-violet-50/50 scale-[0.99] shadow-inner' 
              : 'border-slate-300 bg-white/50 backdrop-blur-md shadow-md hover:border-slate-400'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx" 
            className="hidden" 
          />
          
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 p-[3px] shadow-lg animate-bounce">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <Upload className="w-8 h-8 text-violet-600" />
            </div>
          </div>

          <h3 className="mt-6 text-2xl font-black text-slate-800">Upload Classroom Excel</h3>
          <p className="mt-2 text-slate-500 text-center font-medium max-w-sm">
            Drag & drop your <code className="px-2 py-1 bg-slate-100 rounded text-pink-600 font-bold text-sm">.xlsx</code> student register here, or click to browse.
          </p>

          <button 
            onClick={triggerUploadClick}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 text-white font-extrabold rounded-full hover:scale-105 active:scale-95 shadow-md transition-transform"
          >
            Browse Excel File
          </button>
        </div>

        {/* Mascot Mascot Guide */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-lg">
              <Sparkles className="w-5 h-5" />
              <span>Smart Columns Mapping Guide</span>
            </div>
            
            <div className="space-y-3 font-semibold text-slate-600">
              <p>Upload files with columns in any order. The system will auto-detect headers:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Matches <code className="text-violet-600">PRN, UID, Student ID</code> as Roll Number</li>
                <li>Matches <code className="text-violet-600">Student : First Name, Candidate Name</code> as Student Name</li>
                <li>Matches <code className="text-violet-600">Branch, Course, Stream</code> as Department</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 bg-violet-50/50 p-4 border border-violet-100 rounded-2xl">
            <div className="text-3xl">🤖</div>
            <p className="text-xs text-violet-700 font-semibold leading-relaxed">
              <strong>ArenaBot:</strong> "Hi! Drop any Excel spreadsheet. I'll automatically find the headers, let you map/preview the columns, and import all records securely!"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
