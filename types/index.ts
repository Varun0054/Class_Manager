export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  gender?: string;
  department: string;
  section: string;
  points: number;
  drawCount: number;
  isSelected: boolean;
  isSkipped: boolean;
  lastSelectedAt?: string;
}

export interface DrawHistory {
  id: string;
  activityName: string;
  mode: 'single' | 'multi' | 'spin' | 'lucky' | 'cards' | 'teams';
  selectedStudentIds: string[];
  pointsAwarded: number;
  timestamp: string;
}

export interface Team {
  id: string;
  name: string;
  studentIds: string[];
  color: string;
}

export interface ImportLog {
  filename: string;
  importedBy: string;
  date: string;
  studentCount: number;
  duplicateRowsRemoved: number;
  invalidRows: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  drawSpeed: 'slow' | 'normal' | 'fast';
  confettiEnabled: boolean;
  themeAccent: 'blue' | 'purple' | 'pink' | 'cyan' | 'dynamic';
  autoRemoveSelected: boolean;
  voiceAnnouncement: boolean;
  // Advanced Import Tracking
  importMappings?: Record<string, string>;
  importHistory?: ImportLog[];
}

export interface Classroom {
  id: string;
  name: string;
  department?: string;
  section?: string;
  semester?: string;
  academicYear?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  students: Student[];
  lottery: any[];
  analytics: any[];
  history: DrawHistory[];
  leaderboard: any[];
  teams: Team[];
  settings: GameSettings;
  // Sync state
  isDirty?: boolean;
}

export interface SyncQueueItem {
  id: string;
  classroomId: string;
  timestamp: number;
}
