import { useState } from 'react';
import { Student } from '../types';
import { storage } from '../utils/storage';
import { calculateStudentAnalytics } from '../utils/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Upload, UserPlus, Key, Check } from 'lucide-react';
import { toast } from 'sonner';

interface StudentListProps {
  classId: string;
  students: Student[];
  onStudentsChange: () => void;
}

export function StudentList({ classId, students, onStudentsChange }: StudentListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [accountPassword, setAccountPassword] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    groupAssignment: '',
  });
  const [csvText, setCsvText] = useState('');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStudent: Student = {
      id: crypto.randomUUID(),
      classId,
      studentId: formData.studentId,
      name: formData.name,
      groupAssignment: formData.groupAssignment || undefined,
    };

    storage.saveStudent(newStudent);
    setFormData({ studentId: '', name: '', groupAssignment: '' });
    setShowAddDialog(false);
    onStudentsChange();
    toast.success('Student added successfully');
  };

  const handleBulkImport = () => {
    try {
      const lines = csvText.trim().split('\n');
      const newStudents: Student[] = [];

      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('student') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const [studentId, name, group] = lines[i].split(',').map(s => s.trim());
        
        if (studentId && name) {
          newStudents.push({
            id: crypto.randomUUID(),
            classId,
            studentId,
            name,
            groupAssignment: group || undefined,
          });
        }
      }

      if (newStudents.length > 0) {
        storage.saveStudentsBulk(newStudents);
        setCsvText('');
        setShowBulkDialog(false);
        onStudentsChange();
        toast.success(`${newStudents.length} students imported successfully`);
      } else {
        toast.error('No valid students found in CSV');
      }
    } catch (error) {
      toast.error('Error importing students. Please check CSV format.');
    }
  };

  const handleCreateAccount = (student: Student) => {
    setSelectedStudent(student);
    // Generate a default password based on student ID
    setAccountPassword(student.studentId.toLowerCase());
    setShowAccountDialog(true);
  };

  const handleSaveAccount = () => {
    if (selectedStudent && accountPassword) {
      storage.saveStudentAccount(selectedStudent.studentId, accountPassword, selectedStudent.classId);
      setShowAccountDialog(false);
      setSelectedStudent(null);
      setAccountPassword('');
      toast.success(`Login account created for ${selectedStudent.name}`);
    }
  };

  const hasAccount = (studentId: string) => {
    const accounts = storage.getStudentAccounts();
    return !!accounts[studentId];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>Add and manage students in this class</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Import Students</DialogTitle>
                  <DialogDescription>
                    Import multiple students using CSV format: StudentID, Name, Group (optional)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>CSV Data</Label>
                    <textarea
                      className="w-full h-48 p-3 border rounded-md"
                      placeholder="BSIE-2023-001, Juan Dela Cruz, Group A&#10;BSIE-2023-002, Maria Santos, Group B&#10;BSIE-2023-003, Pedro Garcia, Group A"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleBulkImport} className="w-full">
                    Import Students
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a student to this class manually
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="BSIE-2023-001"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      required
                    />
                  </div>
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
                    <Label htmlFor="group">Group Assignment (Optional)</Label>
                    <Input
                      id="group"
                      placeholder="Group A"
                      value={formData.groupAssignment}
                      onChange={(e) => setFormData({ ...formData, groupAssignment: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">Add Student</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3>No students yet</h3>
            <p className="text-muted-foreground mb-4">
              Add students manually or import from CSV
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Times Called</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Last Called</TableHead>
                <TableHead>Account</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const analytics = calculateStudentAnalytics(student.id);
                const accountExists = hasAccount(student.studentId);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.groupAssignment || '-'}</TableCell>
                    <TableCell>{analytics.timesCalledTotal}</TableCell>
                    <TableCell>{analytics.responseAccuracy}%</TableCell>
                    <TableCell>
                      {analytics.lastCalledDate
                        ? new Date(analytics.lastCalledDate).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {accountExists ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateAccount(student)}
                          className="text-green-600"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Active
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateAccount(student)}
                        >
                          <Key className="w-4 h-4 mr-1" />
                          Create
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Student Account Dialog */}
      <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasAccount(selectedStudent?.studentId || '') ? 'Update' : 'Create'} Student Login Account
            </DialogTitle>
            <DialogDescription>
              Set up login credentials for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student ID (Login Username)</Label>
              <Input value={selectedStudent?.studentId || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="text"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                placeholder="Enter password"
              />
              <p className="text-xs text-muted-foreground">
                Default password is set to the student ID. You can change it here.
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Login Instructions for Student:</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                • Select "Student" account type on login page
              </p>
              <p className="text-sm text-muted-foreground">
                • Enter Student ID: <span className="font-mono">{selectedStudent?.studentId}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                • Enter Password: <span className="font-mono">{accountPassword}</span>
              </p>
            </div>
            <Button onClick={handleSaveAccount} className="w-full">
              {hasAccount(selectedStudent?.studentId || '') ? 'Update' : 'Create'} Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
