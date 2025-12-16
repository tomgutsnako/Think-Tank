import { Student, ParticipationRecord } from '../types';
import { storage } from '../utils/storage';
import { calculateStudentAnalytics } from '../utils/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ClassAnalyticsProps {
  classId: string;
  students: Student[];
}

export function ClassAnalytics({ classId, students }: ClassAnalyticsProps) {
  // Participation distribution
  const participationData = students.map(student => {
    const analytics = calculateStudentAnalytics(student.id);
    return {
      name: student.name.split(' ').slice(0, 2).join(' '), // Shorten name
      calls: analytics.timesCalledTotal,
      accuracy: analytics.responseAccuracy,
    };
  }).sort((a, b) => b.calls - a.calls).slice(0, 10);

  // Overall accuracy distribution
  const accuracyRanges = [
    { range: '90-100%', count: 0, color: '#22c55e' },
    { range: '70-89%', count: 0, color: '#3b82f6' },
    { range: '50-69%', count: 0, color: '#f59e0b' },
    { range: '0-49%', count: 0, color: '#ef4444' },
  ];

  students.forEach(student => {
    const analytics = calculateStudentAnalytics(student.id);
    const accuracy = analytics.responseAccuracy;
    
    if (accuracy >= 90) accuracyRanges[0].count++;
    else if (accuracy >= 70) accuracyRanges[1].count++;
    else if (accuracy >= 50) accuracyRanges[2].count++;
    else accuracyRanges[3].count++;
  });

  // Students needing attention (not called recently or low accuracy)
  const studentsNeedingAttention = students
    .map(student => {
      const analytics = calculateStudentAnalytics(student.id);
      const daysSinceLastCall = analytics.lastCalledDate
        ? Math.floor((Date.now() - new Date(analytics.lastCalledDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      return {
        ...student,
        analytics,
        daysSinceLastCall,
        needsAttention: daysSinceLastCall > 7 || analytics.responseAccuracy < 60,
      };
    })
    .filter(s => s.needsAttention)
    .sort((a, b) => b.daysSinceLastCall - a.daysSinceLastCall)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Participating Students */}
      <Card>
        <CardHeader>
          <CardTitle>Participation Distribution</CardTitle>
          <CardDescription>Top 10 students by number of times called</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={participationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#3b82f6" name="Times Called" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Distribution</CardTitle>
            <CardDescription>Students grouped by response accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={accuracyRanges}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {accuracyRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Students Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle>Students Needing Attention</CardTitle>
            <CardDescription>Not called recently or low accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsNeedingAttention.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>All students are doing well!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsNeedingAttention.map(student => (
                  <div key={student.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p>{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {student.daysSinceLastCall > 900
                          ? 'Never called'
                          : `${student.daysSinceLastCall}d ago`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.analytics.responseAccuracy}% accuracy
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Student Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Student Statistics</CardTitle>
          <CardDescription>Complete overview of all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map(student => {
              const analytics = calculateStudentAnalytics(student.id);
              const trend = analytics.responseAccuracy >= 70 ? 'up' : analytics.responseAccuracy >= 50 ? 'neutral' : 'down';
              
              return (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <p>{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.studentId}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Called</p>
                      <p>{analytics.timesCalledTotal}x</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <div className="flex items-center gap-1">
                        <p>{analytics.responseAccuracy}%</p>
                        {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {trend === 'neutral' && <Minus className="w-4 h-4 text-yellow-500" />}
                        {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last Called</p>
                      <p className="text-sm">
                        {analytics.lastCalledDate
                          ? new Date(analytics.lastCalledDate).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
