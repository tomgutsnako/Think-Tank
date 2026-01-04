import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Teacher, User } from '../types';
import { storage } from '../utils/storage';
import { GraduationCap, Users } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onStudentRegister: () => void;
}

export function LoginPage({ onLogin, onStudentRegister }: LoginPageProps) {
  const [accountType, setAccountType] = useState<'teacher' | 'student'>('teacher');
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    studentId: '',
  });
  const [lastRegisteredAvailable, setLastRegisteredAvailable] = useState(false);

  const tryStudentLogin = (input: string, password: string) => {
    // Try email-based registration first
    if (input.includes('@')) {
      const registration = storage.getStudentRegistrationByEmail(input);
      if (registration && registration.password === password) {
        // Find first student record with this email
        const student = storage.getStudents().find(s => s.email === input);
        if (student) {
          const user: User = {
            id: student.id,
            accountType: 'student',
            studentData: {
              studentId: student.id,
              classId: student.classId,
            },
          };
          storage.setCurrentUser(user);
          onLogin(user);
          return true;
        } else {
          alert('No class enrollment found. Please join a class first.');
          return false;
        }
      }
    }

    // Try traditional student ID login
    const studentAccounts = storage.getStudentAccounts();
    const account = studentAccounts[input];
    if (account && account.password === password) {
      // Find the actual student record
      const student = storage.getStudents().find(s => s.studentId === input);
      if (student) {
        const user: User = {
          id: student.id,
          accountType: 'student',
          studentData: {
            studentId: student.id,
            classId: student.classId,
          },
        };
        storage.setCurrentUser(user);
        onLogin(user);
        // Clear last-registered since user is now signed in
        try { storage.setLastRegistered(null); } catch (e) {}
        // Attempt to store credential in browser (keep updated)
        try {
          const nav: any = navigator as any;
          if (nav.credentials && (window as any).PasswordCredential) {
            const cred = new (window as any).PasswordCredential({ id: student.studentId, password });
            nav.credentials.store(cred).catch(() => {});
          }
        } catch (e) {}
        return true;
      } else {
        alert('Student record not found.');
        return false;
      }
    }

    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === 'teacher') {
      if (isSignup) {
        // Create new teacher account
        const newTeacher: Teacher = {
          id: crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          department: formData.department,
        };
        storage.saveTeacher(newTeacher);
        storage.setCurrentTeacher(newTeacher);

        const user: User = {
          id: newTeacher.id,
          accountType: 'teacher',
          teacherData: newTeacher,
        };
        storage.setCurrentUser(user);
        onLogin(user);
      } else {
        // Teacher login
        const teachers = storage.getTeachers();
        const teacher = teachers.find(t => t.email === formData.email);

        if (teacher) {
          storage.setCurrentTeacher(teacher);
          const user: User = {
            id: teacher.id,
            accountType: 'teacher',
            teacherData: teacher,
          };
          storage.setCurrentUser(user);
          onLogin(user);
        } else {
          alert('Teacher account not found. Please sign up first.');
        }
      }
    } else {
      const success = tryStudentLogin(formData.studentId, formData.password);
      if (!success) {
        alert('Invalid credentials. Please check your email/student ID and password.');
      }
    }
  };

  // On mount: pre-fill form from last-registered and try silent credential retrieval
  useEffect(() => {
    const last = storage.getLastRegistered();
    if (last) {
      if (last.studentId) setFormData(fd => ({ ...fd, studentId: last.studentId as string }));
      if (last.password) setFormData(fd => ({ ...fd, password: last.password as string }));
      setLastRegisteredAvailable(true);
    }

    // Try to get credential silently from the browser
    try {
      const nav: any = navigator as any;
      if (nav.credentials && nav.credentials.get) {
        nav.credentials.get({ password: true, mediation: 'silent' }).then((cred: any) => {
          if (cred && cred.id && cred.password) {
            setFormData(fd => ({ ...fd, studentId: cred.id, password: cred.password }));
            // Attempt immediate sign-in using retrieved credentials
            const success = tryStudentLogin(cred.id, cred.password);
            if (!success) {
              // keep fields filled so user can click Sign In
            }
          }
        }).catch(() => { /* ignore */ });
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Think Tank</CardTitle>
          <CardDescription>
            Web-Based Tool for Enhancing Randomized Recitation and Participation Analytics
          </CardDescription>
          <p className="text-sm text-muted-foreground">TUP-Manila Industrial Education</p>
        </CardHeader>
        <CardContent>
          {/* Account Type Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={accountType === 'teacher' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setAccountType('teacher');
                setIsSignup(false);
              }}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Teacher
            </Button>
            <Button
              type="button"
              variant={accountType === 'student' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                setAccountType('student');
                setIsSignup(false);
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Student
            </Button>
          </div>

          {lastRegisteredAvailable && accountType === 'student' && (
            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-100 text-sm">
              <strong>Tip:</strong> We saved your recently created credentials — they are pre-filled for you.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {accountType === 'teacher' ? (
              <>
                {isSignup && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Prof. Juan Dela Cruz"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="Industrial Education"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="professor@tup.edu.ph"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  {isSignup ? 'Create Teacher Account' : 'Sign In as Teacher'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID or Email</Label>
                  <Input
                    id="studentId"
                    placeholder="TUPM-21-1234 or student@tup.edu.ph"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Sign In as Student
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={onStudentRegister}
                  >
                    Don't have an account? Create one
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Register with your TUP-Manila school email to get started
                </p>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
