import { useState } from 'react';
import { Teacher, Class } from '../types';
import { storage } from '../utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft } from 'lucide-react';

interface CreateClassProps {
  teacher: Teacher;
  onBack: () => void;
  onClassCreated: () => void;
}

export function CreateClass({ teacher, onBack, onClassCreated }: CreateClassProps) {
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    semester: '',
    year: new Date().getFullYear().toString(),
  });

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generateInviteCode = () => {
    // Generate a 6-character invite code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClass: Class = {
      id: crypto.randomUUID(),
      teacherId: teacher.id,
      className: formData.className,
      section: formData.section,
      semester: formData.semester,
      year: formData.year,
      classCode: generateClassCode(),
      inviteCode: generateInviteCode(),
    };

    storage.saveClass(newClass);
    onClassCreated();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Class</CardTitle>
            <CardDescription>
              Add a new class to start tracking student participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="BS Industrial Education"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  placeholder="3A"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    placeholder="1st Semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Input
                    id="year"
                    placeholder="2024-2025"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Class
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
