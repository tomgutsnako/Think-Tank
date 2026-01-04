import { Teacher, Class, Student, Session, ParticipationRecord, User } from '../types';

const STORAGE_KEYS = {
  CURRENT_TEACHER: 'thinktank_current_teacher',
  CURRENT_USER: 'thinktank_current_user',
  TEACHERS: 'thinktank_teachers',
  CLASSES: 'thinktank_classes',
  STUDENTS: 'thinktank_students',
  SESSIONS: 'thinktank_sessions',
  PARTICIPATION: 'thinktank_participation',
  STUDENT_ACCOUNTS: 'thinktank_student_accounts',
  STUDENT_REGISTRATIONS: 'thinktank_student_registrations',
  OFFLINE_MODE: 'thinktank_offline_mode',
  LAST_REGISTER: 'thinktank_last_registered',
};

export const storage = {
  // Teacher operations
  getCurrentTeacher: (): Teacher | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentTeacher: (teacher: Teacher | null) => {
    if (teacher) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify(teacher));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
    }
  },

  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    return data ? JSON.parse(data) : [];
  },

  saveTeacher: (teacher: Teacher) => {
    const teachers = storage.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      teachers[index] = teacher;
    } else {
      teachers.push(teacher);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  // Class operations
  getClasses: (teacherId?: string): Class[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    const classes = data ? JSON.parse(data) : [];
    return teacherId ? classes.filter((c: Class) => c.teacherId === teacherId) : classes;
  },

  saveClass: (classData: Class) => {
    const classes = storage.getClasses();
    const index = classes.findIndex(c => c.id === classData.id);
    if (index >= 0) {
      classes[index] = classData;
    } else {
      classes.push(classData);
    }
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  },

  deleteClass: (classId: string) => {
    const classes = storage.getClasses();
    const filtered = classes.filter(c => c.id !== classId);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(filtered));
  },

  // Student operations
  getStudents: (classId?: string): Student[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const students = data ? JSON.parse(data) : [];
    return classId ? students.filter((s: Student) => s.classId === classId) : students;
  },

  saveStudent: (student: Student) => {
    const students = storage.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  saveStudentsBulk: (students: Student[]) => {
    const existing = storage.getStudents();
    students.forEach(newStudent => {
      const index = existing.findIndex(s => s.id === newStudent.id);
      if (index >= 0) {
        existing[index] = newStudent;
      } else {
        existing.push(newStudent);
      }
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(existing));
  },

  deleteStudent: (studentId: string) => {
    const students = storage.getStudents();
    const filtered = students.filter(s => s.id !== studentId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
  },

  // Session operations
  getSessions: (classId?: string): Session[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const sessions = data ? JSON.parse(data) : [];
    return classId ? sessions.filter((s: Session) => s.classId === classId) : sessions;
  },

  saveSession: (session: Session) => {
    const sessions = storage.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  // Participation operations
  getParticipationRecords: (sessionId?: string): ParticipationRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PARTICIPATION);
    const records = data ? JSON.parse(data) : [];
    return sessionId ? records.filter((r: ParticipationRecord) => r.sessionId === sessionId) : records;
  },

  saveParticipationRecord: (record: ParticipationRecord) => {
    const records = storage.getParticipationRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEYS.PARTICIPATION, JSON.stringify(records));
  },

  getParticipationByStudent: (studentId: string): ParticipationRecord[] => {
    const records = storage.getParticipationRecords();
    return records.filter(r => r.studentId === studentId);
  },

  // User operations (for authentication)
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Offline mode preference
  getOfflineMode: (): boolean => {
    const v = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    return v === 'true';
  },

  setOfflineMode: (enabled: boolean) => {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, enabled ? 'true' : 'false');
  },

  // Last registered credentials (used to autofill / sign-in)
  getLastRegistered: (): { studentId?: string; email?: string; password?: string } | null => {
    const data = localStorage.getItem(STORAGE_KEYS.LAST_REGISTER);
    return data ? JSON.parse(data) : null;
  },

  setLastRegistered: (payload: { studentId?: string; email?: string; password?: string } | null) => {
    if (payload) {
      localStorage.setItem(STORAGE_KEYS.LAST_REGISTER, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_REGISTER);
    }
  },

  // Student account operations (for login)
  getStudentAccounts: (): Record<string, { password: string; studentId: string; classId: string }> => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENT_ACCOUNTS);
    return data ? JSON.parse(data) : {};
  },

  saveStudentAccount: (studentId: string, password: string, classId: string) => {
    const accounts = storage.getStudentAccounts();
    accounts[studentId] = { password, studentId, classId };
    localStorage.setItem(STORAGE_KEYS.STUDENT_ACCOUNTS, JSON.stringify(accounts));
  },

  // Student registration operations (self-signup)
  getStudentRegistrations: (): Record<string, { id: string; name: string; email: string; studentId?: string; password: string; classIds: string[] }> => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENT_REGISTRATIONS);
    return data ? JSON.parse(data) : {};
  },

  saveStudentRegistration: (email: string, registration: { id: string; name: string; email: string; studentId?: string; password: string; classIds: string[] }) => {
    const registrations = storage.getStudentRegistrations();
    registrations[email] = registration;
    localStorage.setItem(STORAGE_KEYS.STUDENT_REGISTRATIONS, JSON.stringify(registrations));
  },

  getStudentRegistrationByEmail: (email: string) => {
    const registrations = storage.getStudentRegistrations();
    return registrations[email] || null;
  },

  addClassToStudentRegistration: (email: string, classId: string) => {
    const registrations = storage.getStudentRegistrations();
    if (registrations[email]) {
      if (!registrations[email].classIds.includes(classId)) {
        registrations[email].classIds.push(classId);
        localStorage.setItem(STORAGE_KEYS.STUDENT_REGISTRATIONS, JSON.stringify(registrations));
      }
    }
  },

  getClassByInviteCode: (inviteCode: string): Class | null => {
    const classes = storage.getClasses();
    return classes.find(c => c.inviteCode === inviteCode) || null;
  },
  // Question operations
  getQuestions: (classId?: string) => {
    const data = localStorage.getItem('thinktank_questions');
    const questions = data ? JSON.parse(data) : [];
    return classId ? questions.filter((q: any) => q.classId === classId) : questions;
  },

  getQuestionsByTopic: (classId: string | undefined, topic: string) => {
    const all = storage.getQuestions(classId);
    return all.filter((q: any) => q.topic.toLowerCase() === topic.toLowerCase());
  },

  saveQuestion: (question: { id: string; classId?: string; topic: string; text: string; createdAt: string }) => {
    const all = storage.getQuestions();
    all.push(question);
    localStorage.setItem('thinktank_questions', JSON.stringify(all));
  },

  deleteQuestion: (id: string) => {
    const all = storage.getQuestions();
    const filtered = all.filter((q: any) => q.id !== id);
    localStorage.setItem('thinktank_questions', JSON.stringify(filtered));
  },
};
