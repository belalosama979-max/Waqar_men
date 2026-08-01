// =========================================
// Core Entity Types
// =========================================

export interface Admin {
  id?: number;
  username: string;
  password: string;
  name: string;
  createdAt: Date;
}

export interface Teacher {
  id?: number;
  name: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id?: number;
  name: string;
  teacherId: number;
  teacherName?: string; // denormalized for display
  totalPoints: number;
  lastRecitation: string | null; // e.g. "جزء 1" or "سورة الفاتحة"
  lastDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recitation {
  id?: number;
  studentId: number;
  studentName?: string; // denormalized for display
  teacherId: number;
  teacherName?: string; // denormalized for display
  date: Date;
  type: RecitationType;
  part?: number; // 1-30 if type === 'جزء'
  surah?: number; // surah index 1-114 if type === 'سورة'
  surahName?: string; // denormalized
  evaluation: EvaluationKey;
  evalPoints: number;
  extraPoints: number;
  totalPoints: number;
  notes?: string;
  createdAt: Date;
}

export interface AppSettings {
  id?: number;
  key: string;
  value: string;
}

// =========================================
// Enum-like types
// =========================================

export type RecitationType = 'جزء' | 'سورة';

export type EvaluationKey =
  | 'ممتاز_جداً'
  | 'ممتاز'
  | 'جيد_جداً'
  | 'لم_يسمع'
  | 'رجع_في_التسميع';

export type UserRole = 'admin' | 'teacher';

// =========================================
// Auth Types
// =========================================

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
  username: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

// =========================================
// Evaluation Types
// =========================================

export interface EvaluationOption {
  key: EvaluationKey;
  label: string;
  defaultPoints: number;
  color: string;
}

// =========================================
// Surah Type
// =========================================

export interface Surah {
  index: number;
  name: string;
  arabicName: string;
}

// =========================================
// Dashboard Stats Types
// =========================================

export interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  todayRecitations: number;
  weekRecitations: number;
  monthRecitations: number;
  bestStudent: Student | null;
  bestTeacher: { teacher: Teacher; totalPoints: number } | null;
  recentActivity: Recitation[];
}

export interface TeacherStats {
  totalStudents: number;
  todayRecitations: number;
  weekRecitations: number;
  totalPoints: number;
}

// =========================================
// Leaderboard Types
// =========================================

export interface LeaderboardEntry {
  rank: number;
  student: Student;
  teacher?: Teacher;
  totalPoints: number;
  lastRecitation: string | null;
  lastDate: Date | null;
}

// =========================================
// Form Types
// =========================================

export interface RecitationFormData {
  date: Date;
  type: RecitationType;
  part?: number;
  surahIndex?: number;
  evaluation: EvaluationKey;
  extraPoints: number;
  notes?: string;
}

export interface TeacherFormData {
  name: string;
  username: string;
}

export interface StudentFormData {
  name: string;
  teacherId: number;
}

// =========================================
// Chart Types
// =========================================

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}
