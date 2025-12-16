import { useState, useEffect } from 'react';
import { Class, Student, Session } from '../types';
import { storage } from '../utils/storage';
import { calculateClassAnalytics, exportToCSV } from '../utils/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Play, Users, BarChart3, Download, Plus, Link2, Copy, RefreshCw } from 'lucide-react';
import { StudentList } from './StudentList';
import { ClassAnalytics } from './ClassAnalytics';
import { toast } from 'sonner';

interface ClassViewProps {
  classId: string;
  onBack: () => void;
  onNavigate: (view: string, id?: string) => void;
}

export function ClassView({ classId, onBack, onNavigate }: ClassViewProps) {
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = () => {
    const cls = storage.getClasses().find(c => c.id === classId);
    setClassData(cls || null);
    setStudents(storage.getStudents(classId));
    const classSessions = storage.getSessions(classId);
    setSessions(classSessions);
    
    // Check for active session
    const active = classSessions.find(s => s.status === 'active' || s.status === 'paused');
    setActiveSession(active || null);
  };

  const handleStartSession = () => {
    onNavigate('randomizer', classId);
  };

  const handleExport = () => {
    exportToCSV(classId);
  };

  const handleCopyInviteCode = () => {
    if (classData?.inviteCode) {
      navigator.clipboard.writeText(classData.inviteCode);
      toast.success('Invite code copied to clipboard!');
    }
  };

  const handleRegenerateInviteCode = () => {
    if (classData) {
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updatedClass = { ...classData, inviteCode: newInviteCode };
      storage.saveClass(updatedClass);
      setClassData(updatedClass);
      toast.success('New invite code generated!');
    }
  };

  if (!classData) {
    return <div>Loading...</div>;
  }

  const analytics = calculateClassAnalytics(classId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1>{classData.className}</h1>
                <p className="text-muted-foreground">
                  {classData.section} • {classData.semester} {classData.year}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={handleStartSession}>
                  <Play className="w-4 h-4 mr-2" />
                  {activeSession ? 'Resume Session' : 'Start Session'}
                </Button>
              </div>
            </div>
            
            {/* Invite Code Section */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Link2 className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Class Invite Code</p>
                <p className="font-mono font-semibold text-lg">{classData.inviteCode || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteCode}
                  disabled={!classData.inviteCode}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateInviteCode}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-3xl">{analytics.totalStudents}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Participation Rate</CardDescription>
                <CardTitle className="text-3xl">{analytics.participationRate}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Accuracy</CardDescription>
                <CardTitle className="text-3xl">{analytics.averageAccuracy}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Sessions</CardDescription>
                <CardTitle className="text-3xl">{analytics.totalSessions}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList>
            <TabsTrigger value="students">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentList
              classId={classId}
              students={students}
              onStudentsChange={loadData}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <ClassAnalytics classId={classId} students={students} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
