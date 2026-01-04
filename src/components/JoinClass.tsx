import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { storage } from '../utils/storage';
import { Student, User } from '../types';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

interface JoinClassProps {
  studentEmail: string;
  onJoinSuccess: (user: User) => void;
}

export function JoinClass({ studentEmail, onJoinSuccess }: JoinClassProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const registration = storage.getStudentRegistrationByEmail(studentEmail);

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registration) {
      setError('Student registration not found');
      return;
    }

    // Find class by invite code
    const classData = storage.getClassByInviteCode(inviteCode.trim().toUpperCase());
    
    if (!classData) {
      setError('Invalid invite code. Please check and try again.');
      return;
    }

    // Check if student is already in this class
    const existingStudents = storage.getStudents(classData.id);
    const alreadyInClass = existingStudents.some(s => s.email === studentEmail);

    if (alreadyInClass) {
      setError('You are already enrolled in this class');
      return;
    }

    // Use registration studentId if provided, otherwise use email prefix
    const studentIdValue = (registration && (registration as any).studentId) ? (registration as any).studentId : studentEmail.split('@')[0];

    // Create student record for this class
    const newStudent: Student = {
      id: crypto.randomUUID(),
      classId: classData.id,
      studentId: studentIdValue,
      name: registration!.name,
      email: studentEmail,
    };

    storage.saveStudent(newStudent);

    // Update student registration with class ID
    storage.addClassToStudentRegistration(studentEmail, classData.id);

    // Update or create student account with class ID (for login)
    const accounts = storage.getStudentAccounts();
    const accountEntry = Object.entries(accounts).find(([_, acc]) => acc.studentId === studentIdValue);
    
    if (accountEntry) {
      const [accountStudentId, accountData] = accountEntry;
      if (!accountData.classId) {
        storage.saveStudentAccount(accountStudentId, accountData.password, classData.id);
      }
    } else {
      // If no account exists (edge case), create it using registration password if available
      const password = (registration && (registration as any).password) ? (registration as any).password : '';
      storage.saveStudentAccount(studentIdValue, password, classData.id);
    }

    setSuccess(true);

    // Auto-login after successful join
    setTimeout(() => {
      const user: User = {
        id: newStudent.id,
        accountType: 'student',
        studentData: {
          studentId: newStudent.id,
          classId: classData.id,
        },
      };
      storage.setCurrentUser(user);
      onJoinSuccess(user);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500 rounded-full p-3">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle>Successfully Joined!</CardTitle>
            <CardDescription>
              You have been enrolled in the class. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Join a Class</CardTitle>
          <CardDescription>
            Enter the invite code provided by your teacher
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-sm">
              <strong>Welcome, {registration?.name}!</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {studentEmail}
            </p>
          </div>
          
          <form onSubmit={handleJoinClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Class Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="uppercase font-mono"
                maxLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Ask your teacher for the 6-character invite code
              </p>
            </div>

            <Button type="submit" className="w-full">
              Join Class
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  // Login instead if already have classes
                  if (registration && registration.classIds.length > 0) {
                    const firstClassId = registration.classIds[0];
                    const students = storage.getStudents(firstClassId);
                    const student = students.find(s => s.email === studentEmail);
                    
                    if (student) {
                      const user: User = {
                        id: student.id,
                        accountType: 'student',
                        studentData: {
                          studentId: student.id,
                          classId: firstClassId,
                        },
                      };
                      storage.setCurrentUser(user);
                      onJoinSuccess(user);
                    }
                  }
                }}
              >
                Already joined a class? Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
