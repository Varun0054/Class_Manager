import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, DrawHistory, Team, GameSettings, Classroom, SyncQueueItem } from '../types';
import { db } from '../lib/db';

export type AppView = 'loading' | 'auth' | 'teacher-dashboard' | 'class-dashboard';

export interface ClassArenaState {
  classrooms: Classroom[];
  activeClassroomId: string | null;
  appView: AppView;
  activeTab: 'dashboard' | 'lottery' | 'leaderboard' | 'database' | 'teams' | 'analytics' | 'history' | 'settings';
  teacherUser: { id: string; name: string; email: string } | null;
  syncQueue: SyncQueueItem[];

  // App Actions
  setAppView: (view: AppView) => void;
  setTeacherUser: (user: { id: string; name: string; email: string } | null) => void;
  createClassroom: (data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt' | 'students' | 'lottery' | 'analytics' | 'history' | 'leaderboard' | 'teams' | 'settings' | 'isDirty'>) => Promise<void>;
  openClassroom: (id: string) => void;
  deleteClassroom: (id: string) => Promise<void>;
  exitClassroom: () => void;

  // Sync Logic
  hydrateFromCloud: () => Promise<void>;
  syncClassroom: (classroomId: string) => Promise<void>;
  processSyncQueue: () => Promise<void>;

  // Active Class Mutators
  setStudents: (students: Student[]) => void;
  addStudent: (student: Omit<Student, 'id' | 'drawCount' | 'points' | 'isSelected' | 'isSkipped'>) => void;
  deleteStudent: (id: string) => void;
  updatePoints: (id: string, amount: number) => void;
  drawStudents: (count: number, activityName: string, mode: DrawHistory['mode']) => Student[];
  resetRound: () => void;
  resetAll: () => void;
  skipStudent: (id: string) => void;
  undoLastDraw: () => void;
  generateTeams: (teamCount: number, studentsPerTeam: number, mode: 'count' | 'size') => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setActiveTab: (tab: ClassArenaState['activeTab']) => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  drawSpeed: 'normal',
  confettiEnabled: true,
  themeAccent: 'dynamic',
  autoRemoveSelected: true,
  voiceAnnouncement: false,
};

// Helper to update the active classroom and always mark it dirty
const updateActiveClassroom = (state: ClassArenaState, updater: (classroom: Classroom) => Partial<Classroom>) => {
  if (!state.activeClassroomId) return { classrooms: state.classrooms };
  return {
    classrooms: state.classrooms.map((c) =>
      c.id === state.activeClassroomId ? { ...c, ...updater(c), isDirty: true } : c
    ),
  };
};

let isSyncingQueue = false;

export const useStore = create<ClassArenaState>()(
  persist(
    (set, get) => ({
      classrooms: [],
      activeClassroomId: null,
      appView: 'loading',
      activeTab: 'dashboard',
      teacherUser: null,
      syncQueue: [],

      setAppView: (appView) => set({ appView }),
      
      setTeacherUser: (teacherUser) => set({ teacherUser }),
      
      hydrateFromCloud: async () => {
        const teacherId = get().teacherUser?.id;
        if (!teacherId) return;
        try {
          const cloudClassrooms = await db.fetchClassrooms(teacherId);
          // Only hydrate if we are online and fetching succeeded
          set({ classrooms: cloudClassrooms });
        } catch (e) {
          console.error('Hydration failed, using persisted local cache.', e);
        }
      },

      syncClassroom: async (classroomId) => {
        const state = get();
        const classroom = state.classrooms.find(c => c.id === classroomId);
        const teacherId = state.teacherUser?.id;
        if (!classroom || !teacherId) return;

        const snapshotUpdatedAt = classroom.updatedAt;

        try {
          await db.saveClassroomState(classroom, teacherId);
          // Clear dirty flag ONLY if the classroom hasn't been modified since we started syncing
          set(s => ({
            classrooms: s.classrooms.map(c => {
              if (c.id === classroomId) {
                return { ...c, isDirty: c.updatedAt === snapshotUpdatedAt ? false : c.isDirty };
              }
              return c;
            }),
            syncQueue: s.syncQueue.filter(q => q.classroomId !== classroomId)
          }));
        } catch (err) {
          console.error(`Offline or failed to sync classroom ${classroomId}`, err);
          const inQueue = get().syncQueue.some(q => q.classroomId === classroomId);
          if (!inQueue) {
            set(s => ({
              syncQueue: [...s.syncQueue, { id: crypto.randomUUID(), classroomId, timestamp: Date.now() }]
            }));
          }
        }
      },

      processSyncQueue: async () => {
        if (isSyncingQueue) return;
        isSyncingQueue = true;

        try {
          const state = get();
          if (typeof navigator !== 'undefined' && !navigator.onLine) return;

          // Process explicit queue
          for (const item of state.syncQueue) {
            await get().syncClassroom(item.classroomId);
          }

          // Process any other dirty classrooms
          const currentStore = get();
          const dirtyClassrooms = currentStore.classrooms.filter(c => c.isDirty);
          for (const classroom of dirtyClassrooms) {
            const inQueue = currentStore.syncQueue.some(q => q.classroomId === classroom.id);
            if (!inQueue) {
              await get().syncClassroom(classroom.id);
            }
          }
        } finally {
          isSyncingQueue = false;
        }
      },

      createClassroom: async (data) => {
        const teacherId = get().teacherUser?.id;
        if (!teacherId) return;

        const newClassroom: Classroom = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          students: [],
          lottery: [],
          analytics: [],
          history: [],
          leaderboard: [],
          teams: [],
          settings: DEFAULT_SETTINGS,
          isDirty: true
        };

        set((state) => ({ classrooms: [...state.classrooms, newClassroom] }));
        
        try {
          await db.createClassroom(newClassroom, teacherId);
          set(s => ({
            classrooms: s.classrooms.map(c => c.id === newClassroom.id ? { ...c, isDirty: false } : c)
          }));
        } catch (e) {
          set(s => ({
            syncQueue: [...s.syncQueue, { id: crypto.randomUUID(), classroomId: newClassroom.id, timestamp: Date.now() }]
          }));
        }
      },

      openClassroom: (id) => set((state) => {
        const updatedClassrooms = state.classrooms.map(c => 
          c.id === id ? { ...c, lastOpenedAt: new Date().toISOString(), isDirty: true } : c
        );
        return {
          classrooms: updatedClassrooms,
          activeClassroomId: id,
          appView: 'class-dashboard',
          activeTab: 'dashboard'
        };
      }),

      deleteClassroom: async (id) => {
        set((state) => ({
          classrooms: state.classrooms.filter(c => c.id !== id),
          activeClassroomId: state.activeClassroomId === id ? null : state.activeClassroomId,
          appView: state.activeClassroomId === id ? 'teacher-dashboard' : state.appView
        }));
        
        try {
           await db.deleteClassroom(id);
        } catch (e) {
           console.error('Failed to delete classroom online', e);
        }
      },

      exitClassroom: () => {
        const state = get();
        if (state.activeClassroomId) {
          const classroom = state.classrooms.find(c => c.id === state.activeClassroomId);
          if (classroom && classroom.isDirty) {
             get().syncClassroom(state.activeClassroomId).catch(console.error);
          }
        }
        set({ activeClassroomId: null, appView: 'teacher-dashboard' });
      },

      setActiveTab: (activeTab) => set({ activeTab }),

      setStudents: (students) => set((state) => 
        updateActiveClassroom(state, () => ({ students, updatedAt: new Date().toISOString() }))
      ),

      addStudent: (newStudent) => set((state) => 
        updateActiveClassroom(state, (c) => ({
          students: [
            ...c.students,
            {
              ...newStudent,
              id: crypto.randomUUID(),
              points: 0,
              drawCount: 0,
              isSelected: false,
              isSkipped: false,
            }
          ],
          updatedAt: new Date().toISOString()
        }))
      ),

      deleteStudent: (id) => set((state) => 
        updateActiveClassroom(state, (c) => ({
          students: c.students.filter((s) => s.id !== id),
          updatedAt: new Date().toISOString()
        }))
      ),

      updatePoints: (id, amount) => set((state) => 
        updateActiveClassroom(state, (c) => ({
          students: c.students.map((s) => 
            s.id === id ? { ...s, points: Math.max(0, s.points + amount) } : s
          ),
          updatedAt: new Date().toISOString()
        }))
      ),

      drawStudents: (count, activityName, mode) => {
        const state = get();
        const activeClass = state.classrooms.find(c => c.id === state.activeClassroomId);
        if (!activeClass) return [];

        const students = activeClass.students;
        const settings = activeClass.settings;
        
        let pool = students.filter((s) => !s.isSelected && !s.isSkipped);
        let updatedStudents = [...students];
        
        if (pool.length === 0) {
          pool = students.filter((s) => !s.isSkipped);
          updatedStudents = updatedStudents.map(s => ({ ...s, isSelected: false }));
        }

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));
        const selectedIds = selected.map((s) => s.id);

        const newHistoryItem: DrawHistory = {
          id: crypto.randomUUID(),
          activityName: activityName || 'Quick Draw',
          mode,
          selectedStudentIds: selectedIds,
          pointsAwarded: 0,
          timestamp: new Date().toISOString()
        };

        updatedStudents = updatedStudents.map((s) => {
          if (selectedIds.includes(s.id)) {
            return {
              ...s,
              isSelected: settings.autoRemoveSelected ? true : s.isSelected,
              drawCount: s.drawCount + 1,
              lastSelectedAt: new Date().toISOString()
            };
          }
          return s;
        });

        set((s) => updateActiveClassroom(s, (c) => ({
          students: updatedStudents,
          history: [newHistoryItem, ...c.history],
          updatedAt: new Date().toISOString()
        })));

        return selected;
      },

      resetRound: () => set((state) => 
        updateActiveClassroom(state, (c) => ({
          students: c.students.map((s) => ({ ...s, isSelected: false, isSkipped: false })),
          updatedAt: new Date().toISOString()
        }))
      ),

      resetAll: () => set((state) => 
        updateActiveClassroom(state, () => ({
          students: [],
          history: [],
          teams: [],
          updatedAt: new Date().toISOString()
        }))
      ),

      skipStudent: (id) => set((state) => 
        updateActiveClassroom(state, (c) => ({
          students: c.students.map((s) => 
            s.id === id ? { ...s, isSkipped: true, isSelected: false } : s
          ),
          updatedAt: new Date().toISOString()
        }))
      ),

      undoLastDraw: () => set((state) => 
        updateActiveClassroom(state, (c) => {
          if (c.history.length === 0) return {};
          const lastDraw = c.history[0];
          const updatedStudents = c.students.map((s) => {
            if (lastDraw.selectedStudentIds.includes(s.id)) {
              return {
                ...s,
                isSelected: false,
                drawCount: Math.max(0, s.drawCount - 1),
              };
            }
            return s;
          });

          return {
            students: updatedStudents,
            history: c.history.slice(1),
            updatedAt: new Date().toISOString()
          };
        })
      ),

      generateTeams: (teamCount, studentsPerTeam, mode) => {
        const state = get();
        const activeClass = state.classrooms.find(c => c.id === state.activeClassroomId);
        if (!activeClass) return;
        
        const students = activeClass.students;
        const available = [...students].sort(() => Math.random() - 0.5);
        if (available.length === 0) return;

        let numTeams = teamCount;
        if (mode === 'size') {
          numTeams = Math.max(1, Math.ceil(available.length / studentsPerTeam));
        }

        const newTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
          id: `team-${i + 1}`,
          name: `Team ${i + 1}`,
          studentIds: [],
          color: [
            'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            'linear-gradient(135deg, #ec4899, #f97316)',
            'linear-gradient(135deg, #06b6d4, #10b981)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            'linear-gradient(135deg, #a855f7, #ec4899)',
          ][i % 6]
        }));

        available.forEach((student, idx) => {
          const teamIdx = idx % numTeams;
          newTeams[teamIdx].studentIds.push(student.id);
        });

        set((s) => updateActiveClassroom(s, () => ({ 
          teams: newTeams,
          updatedAt: new Date().toISOString()
        })));
      },

      updateSettings: (newSettings) => set((state) => 
        updateActiveClassroom(state, (c) => ({
          settings: { ...c.settings, ...newSettings },
          updatedAt: new Date().toISOString()
        }))
      ),
    }),
    {
      name: 'class-arena-store-v3'
    }
  )
);

// Custom hook to access active classroom data easily without changing component logic
export const useActiveClass = () => {
  const store = useStore();
  const activeClass = store.classrooms.find(c => c.id === store.activeClassroomId);
  
  if (!activeClass) {
    return {
      id: '',
      name: '',
      department: '',
      section: '',
      semester: '',
      academicYear: '',
      description: '',
      createdAt: '',
      updatedAt: '',
      students: [],
      lottery: [],
      analytics: [],
      history: [],
      leaderboard: [],
      teams: [],
      settings: DEFAULT_SETTINGS,
      ...store // Include all actions so destructuring doesn't fail
    };
  }
  
  return {
    ...activeClass,
    ...store
  };
};
