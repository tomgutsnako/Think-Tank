import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { storage } from '../utils/storage';
import { GraduationCap, ArrowLeft } from 'lucide-react';

interface StudentRegisterProps {
  onBack: () => void;
  onRegisterSuccess: (email: string) => void;
}

export function StudentRegister({ onBack, onRegisterSuccess }: StudentRegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate school email
    if (!formData.email.endsWith('@tup.edu.ph')) {
      setError('Please use your TUP-Manila school email (@tup.edu.ph)');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if email already exists
    const existingRegistration = storage.getStudentRegistrationByEmail(formData.email);
    if (existingRegistration) {
      setError('An account with this email already exists');
      return;
    }

    // Check if student ID already exists
    const existingStudents = storage.getStudents();
    if (existingStudents.some(s => s.studentId === formData.studentId)) {
      setError('This student ID is already registered');
      return;
    }

    // Create new student registration
    const registration = {
      id: crypto.randomUUID(),
      name: formData.name,
      email: formData.email,
      password: formData.password,
      classIds: [],
    };

    storage.saveStudentRegistration(formData.email, registration);

    // Create student account for login (initially without a class)
    storage.saveStudentAccount(formData.studentId, formData.password, '');

    // Redirect to join class flow
    onRegisterSuccess(formData.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="w-fit -ml-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Create Student Account</CardTitle>
          <CardDescription>
            Register with your TUP-Manila school email to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Juan Dela Cruz"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="TUPM-21-1234"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">TUP-Manila Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@tup.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be a valid @tup.edu.ph email address
              </p>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
