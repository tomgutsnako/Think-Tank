import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Student, ParticipationRecord, Session, Class } from '../types';
import { storage } from '../utils/storage';
import { calculateBadges, getBadgeProgress } from '../utils/badges';
import { LogOut, Award, TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';

interface StudentDashboardProps {
  studentId: string;
  classId: string;
  onLogout: () => void;
}

export function StudentDashboard({ studentId, classId, onLogout }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [participationRecords, setParticipationRecords] = useState<ParticipationRecord[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<any>({});

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('session-updated', handler);
    return () => window.removeEventListener('session-updated', handler);
  }, [studentId, classId]);

  const loadData = () => {
    const studentData = storage.getStudents().find(s => s.id === studentId);
    const classData = storage.getClasses().find(c => c.id === classId);
    const records = storage.getParticipationByStudent(studentId);
    const allSessions = storage.getSessions(classId);
    
    setStudent(studentData || null);
    setClassInfo(classData || null);
    setParticipationRecords(records);
    setSessions(allSessions);
    setBadges(calculateBadges(studentId));
    setBadgeProgress(getBadgeProgress(studentId));
  };

  if (!student || !classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Loading student data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalParticipations = participationRecords.length;
  const correctAnswers = participationRecords.filter(r => r.responseType === 'correct').length;
  const partialAnswers = participationRecords.filter(r => r.responseType === 'partial').length;
  const incorrectAnswers = participationRecords.filter(r => r.responseType === 'incorrect').length;
  const noAnswers = participationRecords.filter(r => r.responseType === 'no-answer').length;
  const accuracyRate = totalParticipations > 0 ? ((correctAnswers + partialAnswers * 0.5) / totalParticipations) * 100 : 0;
  const sessionsParticipated = new Set(participationRecords.map(r => r.sessionId)).size;

  // Get recent participations with session info
  const recentParticipations = participationRecords
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .map(record => {
      const session = sessions.find(s => s.id === record.sessionId);
      return { record, session };
    });

  const getResponseColor = (type: string) => {
    switch (type) {
      case 'correct': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'incorrect': return 'text-red-600 bg-red-50';
      case 'no-answer': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResponseLabel = (type: string) => {
    switch (type) {
      case 'correct': return 'Correct';
      case 'partial': return 'Partial';
      case 'incorrect': return 'Incorrect';
      case 'no-answer': return 'No Answer';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-gray-900">Think Tank</h1>
              <p className="text-sm text-muted-foreground">Student Dashboard</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white">{student.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900">{student.name}</h2>
                <p className="text-sm text-muted-foreground">Student ID: {student.studentId}</p>
                <p className="text-sm text-muted-foreground">
                  {classInfo.className} - {classInfo.section} | {classInfo.semester} {classInfo.year}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Participations</p>
                  <p className="text-2xl text-gray-900">{totalParticipations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                  <p className="text-2xl text-gray-900">{accuracyRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Attended</p>
                  <p className="text-2xl text-gray-900">{sessionsParticipated}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <p className="text-2xl text-gray-900">{badges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Response Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Response Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Correct Answers</span>
                    <span className="text-sm">{correctAnswers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${totalParticipations > 0 ? (correctAnswers / totalParticipations) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Partial Answers</span>
                    <span className="text-sm">{partialAnswers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${totalParticipations > 0 ? (partialAnswers / totalParticipations) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Incorrect Answers</span>
                    <span className="text-sm">{incorrectAnswers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${totalParticipations > 0 ? (incorrectAnswers / totalParticipations) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">No Answer</span>
                    <span className="text-sm">{noAnswers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ width: `${totalParticipations > 0 ? (noAnswers / totalParticipations) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Participations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Participations</CardTitle>
            </CardHeader>
            <CardContent>
              {recentParticipations.length > 0 ? (
                <div className="space-y-3">
                  {recentParticipations.map(({ record, session }) => (
                    <div key={record.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-sm">{session?.topic || 'Unknown Session'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleDateString()} at{' '}
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${getResponseColor(record.responseType)}`}>
                          {getResponseLabel(record.responseType)}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground mt-1">Note: {record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No participation records yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {badges.map((badge) => (
                  <div key={badge.id} className="border rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-amber-50">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        {badge.earnedDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No badges earned yet. Keep participating to unlock achievements!
              </p>
            )}

            {/* Badge Progress */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-gray-900 mb-4">Badge Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">⭐ Active Participant</span>
                    <span className="text-sm">{badgeProgress['active-participant']?.current || 0} / 10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all" 
                      style={{ width: `${badgeProgress['active-participant']?.percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">🏆 Veteran</span>
                    <span className="text-sm">{badgeProgress['veteran']?.current || 0} / 25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all" 
                      style={{ width: `${badgeProgress['veteran']?.percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">🎓 Ace (80% accuracy)</span>
                    <span className="text-sm">{badgeProgress['ace']?.current || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${badgeProgress['ace']?.percentage || 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">🔥 Consistent (5 sessions)</span>
                    <span className="text-sm">{badgeProgress['consistent']?.current || 0} / 5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all" 
                      style={{ width: `${badgeProgress['consistent']?.percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
