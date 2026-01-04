export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Class {
  id: string;
  teacherId: string;
  className: string;
  section: string;
  semester: string;
  year: string;
  classCode: string;
  inviteCode?: string;
}

export interface Student {
  id: string;
  classId: string;
  studentId: string;
  name: string;
  email?: string;
  photoUrl?: string;
  groupAssignment?: string;
}

export interface Session {
  id: string;
  classId: string;
  sessionDate: string;
  topic: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'ended';
  notes?: string;
}

export interface ParticipationRecord {
  id: string;
  sessionId: string;
  studentId: string;
  responseType: 'correct' | 'incorrect' | 'partial' | 'no-answer' | 'absent';
  timestamp: string;
  notes?: string;
}

export interface StudentAnalytics {
  studentId: string;
  timesCalledTotal: number;
  timesCalledThisSession: number;
  responseAccuracy: number;
  lastCalledDate?: string;
  participationTrend: number[];
}

export interface User {
  id: string;
  accountType: 'teacher' | 'student';
  teacherData?: Teacher;
  studentData?: {
    studentId: string;
    classId: string;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earnedDate?: string;
}

export interface Question {
  id: string;
  classId?: string;
  topic: string;
  text: string;
  createdAt: string;
}

export interface StudentRegistration {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  password: string;
  classIds: string[];
}
