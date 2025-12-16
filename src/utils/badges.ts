import { Badge, ParticipationRecord, Session } from '../types';
import { storage } from './storage';

export function calculateBadges(studentId: string): Badge[] {
  const participationRecords = storage.getParticipationByStudent(studentId);
  const allSessions = storage.getSessions();
  const badges: Badge[] = [];

  // First Response Badge - first participation ever
  if (participationRecords.length >= 1) {
    const firstRecord = participationRecords.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )[0];
    badges.push({
      id: 'first-response',
      name: 'First Response',
      description: 'Participated for the first time',
      icon: '🎯',
      requirement: 'Participate once',
      earnedDate: firstRecord.timestamp,
    });
  }

  // Active Participant - 10+ participations
  if (participationRecords.length >= 10) {
    badges.push({
      id: 'active-participant',
      name: 'Active Participant',
      description: 'Participated 10 or more times',
      icon: '⭐',
      requirement: 'Participate 10 times',
      earnedDate: participationRecords[9]?.timestamp,
    });
  }

  // Veteran - 25+ participations
  if (participationRecords.length >= 25) {
    badges.push({
      id: 'veteran',
      name: 'Veteran',
      description: 'Participated 25 or more times',
      icon: '🏆',
      requirement: 'Participate 25 times',
      earnedDate: participationRecords[24]?.timestamp,
    });
  }

  // Perfect Accuracy - 5+ correct responses with 100% accuracy
  const correctAnswers = participationRecords.filter(r => r.responseType === 'correct');
  if (correctAnswers.length >= 5 && participationRecords.length === correctAnswers.length && participationRecords.length >= 5) {
    badges.push({
      id: 'perfect-accuracy',
      name: 'Perfect Accuracy',
      description: 'All responses correct (minimum 5)',
      icon: '💯',
      requirement: '100% correct answers (min 5)',
      earnedDate: correctAnswers[4]?.timestamp,
    });
  }

  // Ace - 80%+ accuracy with at least 5 responses
  const accuracyRate = participationRecords.length > 0 
    ? (correctAnswers.length / participationRecords.length) * 100 
    : 0;
  if (accuracyRate >= 80 && participationRecords.length >= 5) {
    badges.push({
      id: 'ace',
      name: 'Ace',
      description: 'Maintained 80%+ accuracy',
      icon: '🎓',
      requirement: '80% accuracy (min 5 participations)',
    });
  }

  // Consistent - participated in 5+ different sessions
  const uniqueSessions = new Set(participationRecords.map(r => r.sessionId));
  if (uniqueSessions.size >= 5) {
    badges.push({
      id: 'consistent',
      name: 'Consistent',
      description: 'Participated in 5 or more sessions',
      icon: '🔥',
      requirement: 'Participate in 5 sessions',
    });
  }

  // Rising Star - participated in last 3 consecutive sessions
  const student = storage.getStudents().find(s => s.id === studentId);
  if (student) {
    const classSessions = allSessions
      .filter(s => s.classId === student.classId)
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      .slice(0, 3);
    
    if (classSessions.length >= 3) {
      const participatedInAll = classSessions.every(session => 
        participationRecords.some(record => record.sessionId === session.id)
      );
      
      if (participatedInAll) {
        badges.push({
          id: 'rising-star',
          name: 'Rising Star',
          description: 'Participated in last 3 consecutive sessions',
          icon: '🌟',
          requirement: 'Participate in 3 consecutive sessions',
        });
      }
    }
  }

  // Quick Responder - participated in first 5 minutes of a session
  const quickResponses = participationRecords.filter(record => {
    const session = allSessions.find(s => s.id === record.sessionId);
    if (!session) return false;
    
    const sessionStart = new Date(session.startTime).getTime();
    const responseTime = new Date(record.timestamp).getTime();
    const diffMinutes = (responseTime - sessionStart) / (1000 * 60);
    
    return diffMinutes <= 5;
  });

  if (quickResponses.length >= 1) {
    badges.push({
      id: 'quick-responder',
      name: 'Quick Responder',
      description: 'Responded within first 5 minutes of a session',
      icon: '⚡',
      requirement: 'Respond within 5 minutes of session start',
      earnedDate: quickResponses[0]?.timestamp,
    });
  }

  return badges;
}

export function getBadgeProgress(studentId: string): Record<string, { current: number; target: number; percentage: number }> {
  const participationRecords = storage.getParticipationByStudent(studentId);
  const correctAnswers = participationRecords.filter(r => r.responseType === 'correct');
  const uniqueSessions = new Set(participationRecords.map(r => r.sessionId));
  const accuracyRate = participationRecords.length > 0 
    ? (correctAnswers.length / participationRecords.length) * 100 
    : 0;

  return {
    'active-participant': {
      current: participationRecords.length,
      target: 10,
      percentage: Math.min((participationRecords.length / 10) * 100, 100),
    },
    'veteran': {
      current: participationRecords.length,
      target: 25,
      percentage: Math.min((participationRecords.length / 25) * 100, 100),
    },
    'ace': {
      current: Math.round(accuracyRate),
      target: 80,
      percentage: Math.min((accuracyRate / 80) * 100, 100),
    },
    'consistent': {
      current: uniqueSessions.size,
      target: 5,
      percentage: Math.min((uniqueSessions.size / 5) * 100, 100),
    },
  };
}
