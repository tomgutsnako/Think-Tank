import { useState, useEffect } from 'react';
import { Teacher, User } from './types';
import { storage } from './utils/storage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { CreateClass } from './components/CreateClass';
import { ClassView } from './components/ClassView';
import { Randomizer } from './components/Randomizer';
import { StudentRegister } from './components/StudentRegister';
import { JoinClass } from './components/JoinClass';
import { Toaster } from './components/ui/sonner';

type View = 'login' | 'dashboard' | 'student-dashboard' | 'create-class' | 'class-view' | 'randomizer' | 'student-register' | 'join-class';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');

  useEffect(() => {
    // Check for existing session
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.accountType === 'teacher' && user.teacherData) {
        setCurrentTeacher(user.teacherData);
        setCurrentView('dashboard');
      } else if (user.accountType === 'student') {
        setCurrentView('student-dashboard');
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.accountType === 'teacher' && user.teacherData) {
      setCurrentTeacher(user.teacherData);
      setCurrentView('dashboard');
    } else if (user.accountType === 'student') {
      setCurrentView('student-dashboard');
    }
  };

  const handleLogout = () => {
    storage.setCurrentTeacher(null);
    storage.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentTeacher(null);
    setCurrentView('login');
    setSelectedClassId('');
  };

  const handleNavigate = (view: string, classId?: string) => {
    if (classId) {
      setSelectedClassId(classId);
    }
    setCurrentView(view as View);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedClassId('');
  };

  return (
    <>
      {currentView === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onStudentRegister={() => setCurrentView('student-register')}
        />
      )}

      {currentView === 'student-register' && (
        <StudentRegister
          onBack={() => setCurrentView('login')}
          onRegisterSuccess={(email) => {
            setStudentEmail(email);
            setCurrentView('join-class');
          }}
        />
      )}

      {currentView === 'join-class' && (
        <JoinClass
          studentEmail={studentEmail}
          onJoinSuccess={handleLogin}
        />
      )}

      {currentView === 'student-dashboard' && currentUser?.accountType === 'student' && currentUser.studentData && (
        <StudentDashboard
          studentId={currentUser.studentData.studentId}
          classId={currentUser.studentData.classId}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'dashboard' && currentTeacher && (
        <Dashboard
          teacher={currentTeacher}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'create-class' && currentTeacher && (
        <CreateClass
          teacher={currentTeacher}
          onBack={handleBackToDashboard}
          onClassCreated={handleBackToDashboard}
        />
      )}

      {currentView === 'class-view' && selectedClassId && (
        <ClassView
          classId={selectedClassId}
          onBack={handleBackToDashboard}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'randomizer' && selectedClassId && (
        <Randomizer
          classId={selectedClassId}
          onBack={() => handleNavigate('class-view', selectedClassId)}
        />
      )}

      <Toaster />
    </>
  );
}
