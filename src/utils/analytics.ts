import { Student, ParticipationRecord, Session } from '../types';
import { storage } from './storage';

export function calculateStudentAnalytics(studentId: string, sessionId?: string) {
  const allRecords = storage.getParticipationByStudent(studentId);
  const sessionRecords = sessionId 
    ? allRecords.filter(r => r.sessionId === sessionId)
    : [];

  const correctResponses = allRecords.filter(r => r.responseType === 'correct').length;
  const totalResponses = allRecords.length;
  const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0;

  const lastRecord = allRecords.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  return {
    studentId,
    timesCalledTotal: allRecords.length,
    timesCalledThisSession: sessionRecords.length,
    responseAccuracy: Math.round(accuracy),
    lastCalledDate: lastRecord?.timestamp,
  };
}

export function getWeightedRandomStudent(
  students: Student[],
  sessionId: string,
  excludeStudentIds: string[] = []
): Student | null {
  if (students.length === 0) return null;

  const availableStudents = students.filter(s => !excludeStudentIds.includes(s.id));
  if (availableStudents.length === 0) return null;

  // Calculate weights based on participation frequency
  const weights = availableStudents.map(student => {
    const analytics = calculateStudentAnalytics(student.id, sessionId);
    const timesCalledThisSession = analytics.timesCalledThisSession;
    
    // Students called less get higher weight
    // Base weight is 10, decreases by 3 for each time called
    const weight = Math.max(1, 10 - (timesCalledThisSession * 3));
    return weight;
  });

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // Pick random number between 0 and totalWeight
  let random = Math.random() * totalWeight;
  
  // Find the student based on weighted probability
  for (let i = 0; i < availableStudents.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return availableStudents[i];
    }
  }
  
  return availableStudents[0];
}

export function calculateClassAnalytics(classId: string) {
  const students = storage.getStudents(classId);
  const sessions = storage.getSessions(classId);
  const allRecords = storage.getParticipationRecords();

  const classRecords = allRecords.filter(record => {
    const session = sessions.find(s => s.id === record.sessionId);
    return session?.classId === classId;
  });

  const totalStudents = students.length;
  const studentsWithParticipation = new Set(classRecords.map(r => r.studentId)).size;
  const participationRate = totalStudents > 0 
    ? (studentsWithParticipation / totalStudents) * 100 
    : 0;

  const correctResponses = classRecords.filter(r => r.responseType === 'correct').length;
  const averageAccuracy = classRecords.length > 0
    ? (correctResponses / classRecords.length) * 100
    : 0;

  return {
    totalStudents,
    studentsWithParticipation,
    participationRate: Math.round(participationRate),
    averageAccuracy: Math.round(averageAccuracy),
    totalSessions: sessions.length,
    totalParticipations: classRecords.length,
  };
}

export function exportToCSV(classId: string) {
  const students = storage.getStudents(classId);
  const classData = storage.getClasses().find(c => c.id === classId);
  
  const csvData = students.map(student => {
    const analytics = calculateStudentAnalytics(student.id);
    return {
      'Student ID': student.studentId,
      'Name': student.name,
      'Group': student.groupAssignment || 'N/A',
      'Times Called': analytics.timesCalledTotal,
      'Response Accuracy': `${analytics.responseAccuracy}%`,
      'Last Called': analytics.lastCalledDate 
        ? new Date(analytics.lastCalledDate).toLocaleDateString()
        : 'Never',
    };
  });

  const headers = Object.keys(csvData[0] || {});
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${classData?.className}_participation_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
