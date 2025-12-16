import { storage } from './storage';
import { Teacher, Class, Student, Session, ParticipationRecord } from '../types';

export function initializeDemoData() {
  // Check if demo data already exists
  const existingTeachers = storage.getTeachers();
  if (existingTeachers.length > 0) {
    return; // Demo data already initialized
  }

  // Create demo teacher
  const demoTeacher: Teacher = {
    id: 'teacher-demo-1',
    name: 'Prof. Maria Santos',
    email: 'maria.santos@tup.edu.ph',
    department: 'Industrial Education',
  };
  storage.saveTeacher(demoTeacher);

  // Create demo class
  const demoClass: Class = {
    id: 'class-demo-1',
    teacherId: demoTeacher.id,
    className: 'Industrial Engineering Fundamentals',
    section: 'BSIE 3-1',
    semester: '1st Semester',
    year: '2024-2025',
    classCode: 'IE301',
  };
  storage.saveClass(demoClass);

  // Create demo students
  const demoStudents: Student[] = [
    {
      id: 'student-1',
      classId: demoClass.id,
      studentId: 'TUPM-21-1001',
      name: 'Juan Dela Cruz',
      groupAssignment: 'Group A',
    },
    {
      id: 'student-2',
      classId: demoClass.id,
      studentId: 'TUPM-21-1002',
      name: 'Maria Clara',
      groupAssignment: 'Group A',
    },
    {
      id: 'student-3',
      classId: demoClass.id,
      studentId: 'TUPM-21-1003',
      name: 'Jose Rizal',
      groupAssignment: 'Group B',
    },
    {
      id: 'student-4',
      classId: demoClass.id,
      studentId: 'TUPM-21-1004',
      name: 'Andres Bonifacio',
      groupAssignment: 'Group B',
    },
    {
      id: 'student-5',
      classId: demoClass.id,
      studentId: 'TUPM-21-1005',
      name: 'Emilio Aguinaldo',
      groupAssignment: 'Group C',
    },
  ];
  storage.saveStudentsBulk(demoStudents);

  // Create student accounts with default passwords
  demoStudents.forEach(student => {
    storage.saveStudentAccount(student.studentId, student.studentId.toLowerCase(), student.classId);
  });

  // Create demo session
  const demoSession: Session = {
    id: 'session-demo-1',
    classId: demoClass.id,
    sessionDate: new Date().toISOString(),
    topic: 'Introduction to Process Improvement',
    startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    endTime: new Date().toISOString(),
    status: 'ended',
    notes: 'Demo session',
  };
  storage.saveSession(demoSession);

  // Create demo participation records
  const demoParticipation: ParticipationRecord[] = [
    {
      id: 'part-1',
      sessionId: demoSession.id,
      studentId: 'student-1',
      responseType: 'correct',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
      notes: 'Great answer!',
    },
    {
      id: 'part-2',
      sessionId: demoSession.id,
      studentId: 'student-2',
      responseType: 'correct',
      timestamp: new Date(Date.now() - 2500000).toISOString(),
    },
    {
      id: 'part-3',
      sessionId: demoSession.id,
      studentId: 'student-3',
      responseType: 'partial',
      timestamp: new Date(Date.now() - 2000000).toISOString(),
    },
    {
      id: 'part-4',
      sessionId: demoSession.id,
      studentId: 'student-1',
      responseType: 'correct',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
    },
    {
      id: 'part-5',
      sessionId: demoSession.id,
      studentId: 'student-4',
      responseType: 'incorrect',
      timestamp: new Date(Date.now() - 1000000).toISOString(),
    },
  ];

  demoParticipation.forEach(record => {
    storage.saveParticipationRecord(record);
  });

  console.log('Demo data initialized successfully!');
}
