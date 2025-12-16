import { useState, useEffect } from 'react';
import { Teacher, Class } from '../types';
import { storage } from '../utils/storage';
import { calculateClassAnalytics } from '../utils/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Users, BookOpen, TrendingUp, LogOut } from 'lucide-react';

interface DashboardProps {
  teacher: Teacher;
  onLogout: () => void;
  onNavigate: (view: string, classId?: string) => void;
}

export function Dashboard({ teacher, onLogout, onNavigate }: DashboardProps) {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    loadClasses();
  }, [teacher.id]);

  const loadClasses = () => {
    const teacherClasses = storage.getClasses(teacher.id);
    setClasses(teacherClasses);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1>Think Tank</h1>
              <p className="text-muted-foreground">Welcome back, {teacher.name}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2>My Classes</h2>
              <p className="text-muted-foreground">Manage your classes and track participation</p>
            </div>
            <Button onClick={() => onNavigate('create-class')}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Class
            </Button>
          </div>

          {classes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3>No classes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first class
                </p>
                <Button onClick={() => onNavigate('create-class')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => {
                const analytics = calculateClassAnalytics(classItem.id);
                const students = storage.getStudents(classItem.id);
                
                return (
                  <Card
                    key={classItem.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onNavigate('class-view', classItem.id)}
                  >
                    <CardHeader>
                      <CardTitle>{classItem.className}</CardTitle>
                      <CardDescription>
                        {classItem.section} • {classItem.semester} {classItem.year}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{students.length} Students</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{analytics.totalSessions} Sessions</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{analytics.participationRate}% Participation</span>
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-sm text-muted-foreground">Class Code</p>
                          <p className="font-mono">{classItem.classCode}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
