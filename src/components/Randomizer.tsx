import { useState, useEffect } from 'react';
import { Class, Student, Session, ParticipationRecord, Question } from '../types';
import { storage } from '../utils/storage';
import { getWeightedRandomStudent, calculateStudentAnalytics } from '../utils/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ArrowLeft, Play, Pause, StopCircle, User, Check, X, Minus, RotateCcw, Hand, Search, Grid3x3, Disc, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Motion aliases to satisfy TypeScript when using className
const MotionDiv: any = motion.div;
const MotionSpan: any = motion.span;
import { toast } from 'sonner';
import { CardRandomizer } from './CardRandomizer';
import NameScroller from './NameScroller';

interface RandomizerProps {
  classId: string;
  onBack: () => void;
}

export function Randomizer({ classId, onBack }: RandomizerProps) {
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [calledStudents, setCalledStudents] = useState<string[]>([]);
  const [sessionTopic, setSessionTopic] = useState('');
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [showManualSelectDialog, setShowManualSelectDialog] = useState(false);
  const [avoidRepetition, setAvoidRepetition] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [randomizerMode, setRandomizerMode] = useState<'spinner' | 'cards'>('spinner');

  // Question integration
  const [questionFlow, setQuestionFlow] = useState<'student-first' | 'question-first'>('student-first');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Scroller integration
  const [pendingStudent, setPendingStudent] = useState<Student | null>(null);
  const [scrollerFinalIndex, setScrollerFinalIndex] = useState<number | null>(null);
  const [scrollerKey, setScrollerKey] = useState<number>(0);
  const [scrollerSpins, setScrollerSpins] = useState<number>(6);

  useEffect(() => {
    loadData();

    const handler = () => loadData();
    window.addEventListener('session-updated', handler);

    const qHandler = (e: any) => {
      const q = e?.detail as Question | undefined;
      if (q) {
        setSelectedQuestion(q);
        toast.success('Question selected');
      }
    };

    window.addEventListener('question-selected', qHandler as EventListener);

    return () => {
      window.removeEventListener('session-updated', handler);
      window.removeEventListener('question-selected', qHandler as EventListener);
    };
  }, [classId]);

  const loadData = () => {
    const cls = storage.getClasses().find(c => c.id === classId);
    setClassData(cls || null);
    setStudents(storage.getStudents(classId));
    
    // Check for existing active session
    const sessions = storage.getSessions(classId);
    const activeSession = sessions.find(s => s.status === 'active' || s.status === 'paused');
    
    if (activeSession) {
      setSession(activeSession);
      setSessionTopic(activeSession.topic);
      setShowStartDialog(false);
      
      // Load already called students in this session
      const records = storage.getParticipationRecords(activeSession.id);
      setCalledStudents(records.map(r => r.studentId));
    }
  };

  const handleStartSession = () => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      classId,
      sessionDate: new Date().toISOString().split('T')[0],
      topic: sessionTopic,
      startTime: new Date().toISOString(),
      status: 'active',
    };
    
    storage.saveSession(newSession);
    setSession(newSession);
    setShowStartDialog(false);
    toast.success('Session started');
    window.dispatchEvent(new CustomEvent('session-updated'));
  };

  const handlePickStudent = () => {
    if (!session || isSpinning) return;

    // If we're in question-first mode and no question is selected, pick a question first
    if (questionFlow === 'question-first' && !selectedQuestion) {
      const qs = storage.getQuestions(classId);
      if (qs.length === 0) {
        toast.error('No questions available for this class');
        return;
      }
      const q = qs[Math.floor(Math.random() * qs.length)];
      setSelectedQuestion(q);
      toast.success('Question chosen');
      // Brief pause so teacher can see the question, then pick student
      setTimeout(() => startSpin(), 700);
      return;
    }

    startSpin();
  };

  const startSpin = () => {
    if (!session) return;

    // Determine which students to exclude
    const excludeIds = avoidRepetition ? calledStudents : [];

    // Select final student with weighted randomness now
    const finalStudent = getWeightedRandomStudent(students, session.id, excludeIds);
    if (!finalStudent) {
      toast.error('No available students to pick');
      return;
    }

    const finalIndex = students.findIndex(s => s.id === finalStudent.id);
    if (finalIndex === -1) {
      toast.error('Selected student not found');
      return;
    }

    // Prepare scroller
    setPendingStudent(finalStudent);
    setScrollerFinalIndex(finalIndex);
    setScrollerSpins(4 + Math.floor(Math.random() * 4)); // 4-7 spins
    setScrollerKey(k => k + 1);
    setIsSpinning(true);
  };

  const handleRecordResponse = (responseType: 'correct' | 'incorrect' | 'partial' | 'no-answer' | 'absent') => {
    if (!session || !selectedStudent) return;
    
    const record: ParticipationRecord = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      studentId: selectedStudent.id,
      responseType,
      timestamp: new Date().toISOString(),
    };
    
    storage.saveParticipationRecord(record);
    setCalledStudents([...calledStudents, selectedStudent.id]);
    setShowResponseDialog(false);
    setSelectedQuestion(null);
    toast.success('Response recorded');
    // Notify other components to reload data (e.g., StudentDashboard)
    window.dispatchEvent(new CustomEvent('session-updated'));
  };

  const handleTogglePause = () => {
    if (!session) return;
    
    const newStatus: Session['status'] = session.status === 'active' ? 'paused' : 'active';
    const updatedSession: Session = { ...session, status: newStatus };
    storage.saveSession(updatedSession);
    setSession(updatedSession);
    toast.success(newStatus === 'paused' ? 'Session paused' : 'Session resumed');
    window.dispatchEvent(new CustomEvent('session-updated'));
  };

  const handleEndSession = () => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      status: 'ended' as const,
      endTime: new Date().toISOString(),
    };
    storage.saveSession(updatedSession);
    toast.success('Session ended');
    window.dispatchEvent(new CustomEvent('session-updated'));
    onBack();
  };

  const handleResetSelection = () => {
    setCalledStudents([]);
    toast.success('Selection pool reset');
  };

  const handleManualSelect = (student: Student) => {
    setSelectedStudent(student);
    setShowManualSelectDialog(false);
    setShowResponseDialog(true);
    setSearchQuery('');
  };

  const handleCardRevealed = (student: Student) => {
    setSelectedStudent(student);
    setShowResponseDialog(true);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!classData) return <div>Loading...</div>;

  const remainingStudents = students.filter(s => !calledStudents.includes(s.id));
  const participationRate = students.length > 0 
    ? Math.round((calledStudents.length / students.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Session</DialogTitle>
            <DialogDescription>
              Enter a topic for this recitation session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Session Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Safety Protocols in Manufacturing"
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
              />
            </div>
            <Button onClick={handleStartSession} disabled={!sessionTopic} className="w-full">
              Start Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Response Recording Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Response</DialogTitle>
            <DialogDescription>
              {selectedQuestion && (
                <div className="mb-2">
                  <strong>Question:</strong> {selectedQuestion.text}
                </div>
              )}
              How did {selectedStudent?.name} respond?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleRecordResponse('correct')}
              className="h-20 bg-green-500 hover:bg-green-600"
            >
              <Check className="w-6 h-6 mr-2" />
              Correct
            </Button>
            <Button
              onClick={() => handleRecordResponse('incorrect')}
              className="h-20 bg-red-500 hover:bg-red-600"
            >
              <X className="w-6 h-6 mr-2" />
              Incorrect
            </Button>
            <Button
              onClick={() => handleRecordResponse('partial')}
              className="h-20 bg-yellow-500 hover:bg-yellow-600"
            >
              <Minus className="w-6 h-6 mr-2" />
              Partial
            </Button>
            <Button
              onClick={() => handleRecordResponse('no-answer')}
              className="h-20 bg-gray-500 hover:bg-gray-600"
            >
              <User className="w-6 h-6 mr-2" />
              No Answer
            </Button>
            <Button
              onClick={() => handleRecordResponse('absent')}
              className="h-20 bg-neutral-700 hover:bg-neutral-800 col-span-2"
            >
              <Hand className="w-6 h-6 mr-2" />
              Absent
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Selection Dialog */}
      <Dialog open={showManualSelectDialog} onOpenChange={setShowManualSelectDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manual Student Selection</DialogTitle>
            <DialogDescription>
              Select a student manually or mark a volunteer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No students found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => {
                    const alreadyCalled = calledStudents.includes(student.id);
                    return (
                      <button
                        key={student.id}
                        onClick={() => handleManualSelect(student)}
                        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors text-left"
                      >
                        <div className="flex-1">
                          <p>{student.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {student.studentId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.groupAssignment && (
                            <Badge variant="outline">{student.groupAssignment}</Badge>
                          )}
                          {alreadyCalled && (
                            <Badge variant="secondary">Already Called</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Class
              </Button>
            </div>
            <div className="flex gap-3">
              {session && (
                <>
                  <Button variant="outline" onClick={handleTogglePause}>
                    {session.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    )}
                  </Button>
                  <Button variant="destructive" onClick={handleEndSession}>
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Randomizer Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle>Student Randomizer</CardTitle>
                    <CardDescription>{sessionTopic}</CardDescription>
                  </div>
                  {session && (
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  )}
                </div>
                {/* Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={randomizerMode === 'spinner' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRandomizerMode('spinner')}
                  >
                    <Disc className="w-4 h-4 mr-2" />
                    Spinner Mode
                  </Button>
                  <Button
                    variant={randomizerMode === 'cards' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRandomizerMode('cards')}
                  >
                    <Grid3x3 className="w-4 h-4 mr-2" />
                    Card Mode
                  </Button>
                </div>

                {/* Question Flow Toggle */}
                <div className="flex gap-2 mt-3 items-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant={questionFlow === 'student-first' ? 'default' : 'outline'} onClick={() => setQuestionFlow('student-first')}>
                      Student First
                    </Button>
                    <Button size="sm" variant={questionFlow === 'question-first' ? 'default' : 'outline'} onClick={() => setQuestionFlow('question-first')}>
                      Question First
                    </Button>
                  </div>
                  <div className="ml-4">
                    <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('open-question-dialog'))}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {randomizerMode === 'spinner' ? (
                  <>
                    {/* Student Display */}
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-12 min-h-[300px] flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isSpinning ? (
                          <div key={"name-scroller"} className="w-full">
                            <NameScroller
                              key={scrollerKey}
                              students={students}
                              finalIndex={scrollerFinalIndex ?? 0}
                              spins={scrollerSpins}
                              itemHeight={64}
                              visibleCount={3}
                              onComplete={() => {
                                setIsSpinning(false);
                                if (pendingStudent) {
                                  setSelectedStudent(pendingStudent);
                                  setPendingStudent(null);
                                  setShowResponseDialog(true);
                                }
                                window.dispatchEvent(new CustomEvent('session-updated'));
                              }}
                            />
                          </div>
                        ) : selectedStudent ? (
                          <MotionDiv
                            key={selectedStudent.id}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="text-center"
                          >
                            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto">
                              <User className="w-12 h-12 text-indigo-600" />
                            </div>
                            <h2 className="text-white mb-2">{selectedStudent.name}</h2>
                            <p className="text-indigo-100 font-mono">{selectedStudent.studentId}</p>
                            {selectedStudent.groupAssignment && (
                              <Badge className="mt-2">{selectedStudent.groupAssignment}</Badge>
                            )}
                          </MotionDiv>
                        ) : (
                          <MotionDiv
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-white"
                          >
                            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-xl">Click "Random Pick" to begin</p>
                          </MotionDiv>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={handlePickStudent}
                          disabled={isSpinning || !session || session.status !== 'active' || remainingStudents.length === 0}
                          className="h-14 text-lg"
                        >
                          {isSpinning ? (
                            <MotionDiv
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <RotateCcw className="w-5 h-5 mr-2" />
                            </MotionDiv>
                          ) : (
                            <Play className="w-5 h-5 mr-2" />
                          )}
                          {isSpinning ? 'Selecting...' : 'Random Pick'}
                        </Button>
                        <Button
                          onClick={() => setShowManualSelectDialog(true)}
                          disabled={!session || session.status !== 'active' || students.length === 0}
                          variant="secondary"
                          className="h-14 text-lg"
                        >
                          <Hand className="w-5 h-5 mr-2" />
                          Manual Select
                        </Button>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setAvoidRepetition(!avoidRepetition)}
                          className="flex-1"
                        >
                          {avoidRepetition ? 'Avoid Repetition: ON' : 'Avoid Repetition: OFF'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleResetSelection}
                          disabled={calledStudents.length === 0}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset Pool
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <CardRandomizer
                    students={students}
                    onStudentRevealed={handleCardRevealed}
                    isSessionActive={session?.status === 'active'}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p>{classData.className} {classData.section}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl">{students.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students Called</p>
                  <p className="text-2xl">{calledStudents.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl">{remainingStudents.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participation Rate</p>
                  <p className="text-2xl">{participationRate}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Called This Session</CardTitle>
              </CardHeader>
              <CardContent>
                {!session || calledStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No students called yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(() => {
                      const records = storage.getParticipationRecords(session.id);
                      return records.map((record) => {
                        const student = students.find(s => s.id === record.studentId);
                        if (!student) return null;
                        
                        return (
                          <div key={record.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.studentId}</p>
                            </div>
                            <Badge variant={
                              record.responseType === 'correct' ? 'default' :
                              record.responseType === 'partial' ? 'secondary' :
                              record.responseType === 'no-answer' ? 'outline' :
                              record.responseType === 'absent' ? 'outline' :
                              'destructive'
                            }>
                              {record.responseType === 'correct' ? 'Correct' :
                                record.responseType === 'partial' ? 'Partial' :
                                record.responseType === 'incorrect' ? 'Incorrect' :
                                record.responseType === 'no-answer' ? 'No Answer' :
                                record.responseType === 'absent' ? 'Absent' :
                                record.responseType}
                            </Badge>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
