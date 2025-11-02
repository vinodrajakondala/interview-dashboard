import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, TrendingUp, Users, AlertCircle, CheckCircle, Upload, RotateCcw, FileText } from 'lucide-react';

interface Interview {
  id: string;
  date: string;
  time: string;
  status: 'scheduled' | 'cancelled';
}

interface EnrichedInterview extends Interview {
  date: Date;
  dayOfWeek: string;
  isWeekend: boolean;
  timeSlot: string;
  hour: number;
  status: 'completed' | 'upcoming' | 'cancelled';
}

const InterviewDashboard = () => {
  const initialData = `Candidate ID: C14954072
Date: 2025-05-21
Time:   16:00 - 17:00  IST
Candidate ID: C11776200
Date: 2025-07-19
Time:   11:00 - 12:00  IST
Candidate ID: C16377895
Date: 2025-07-23
Time:   17:00 - 18:00  IST
Cancelled
Candidate ID: C16585086
Date: 2025-07-26
Time:   14:00 - 15:00  IST
Candidate ID: C10980940
Date: 2025-08-12
Time:   19:00 - 20:00  IST
Candidate ID: C14868460
Date: 2025-08-21
Time:   16:00 - 17:00  IST
Candidate ID: C16610239
Date: 2025-09-20
Time:   20:00 - 21:00  IST
Candidate ID: C16588635
Date: 2025-10-08
Time:   16:00 - 17:00  IST
Candidate ID: C06738172
Date: 2025-10-13
Time:   18:00 - 19:00  IST
Candidate ID: C17180244
Date: 2025-10-16
Time:   17:00 - 18:00  IST
Candidate ID: C09408711
Date: 2025-11-01
Time:   10:00 - 11:00  IST
Candidate ID: C18808222
Date: 2025-11-03
Time:   15:00 - 16:00  IST
Candidate ID: C18461824
Date: 2025-11-07
Time:   16:00 - 17:00  IST`;

  const [inputData, setInputData] = useState('');
  const [parsedInterviews, setParsedInterviews] = useState<EnrichedInterview[] | null>(null);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [modalData, setModalData] = useState<EnrichedInterview[] | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const parseInterviewData = (text: string): Interview[] => {
    try {
      const lines = text.trim().split('\n');
      const interviews: Interview[] = [];
      let currentInterview: Partial<Interview> = {};
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('Candidate ID:')) {
          if (currentInterview.id) {
            interviews.push({ ...currentInterview as Interview });
          }
          currentInterview = {
            id: line.split(':')[1].trim(),
            status: 'scheduled'
          };
        } else if (line.startsWith('Date:')) {
          currentInterview.date = line.split(':')[1].trim();
        } else if (line.startsWith('Time:')) {
          currentInterview.time = line.split('Time:')[1].trim().replace('IST', '').trim();
        } else if (line.toLowerCase().includes('cancel')) {
          if (currentInterview.id) {
            currentInterview.status = 'cancelled';
          }
        }
      }
      
      if (currentInterview.id) {
        interviews.push(currentInterview as Interview);
      }

      if (interviews.length === 0) {
        throw new Error('No valid interview data found');
      }

      // Validate each interview has required fields
      for (let interview of interviews) {
        if (!interview.id || !interview.date || !interview.time) {
          throw new Error('Missing required fields (Candidate ID, Date, or Time)');
        }
      }

      return interviews;
    } catch (err) {
      throw new Error('Invalid format: ' + (err as Error).message);
    }
  };

  const enrichInterviews = (interviews: Interview[]): EnrichedInterview[] => {
    const today = new Date();
    
    return interviews.map(interview => {
      const date = new Date(interview.date);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const hour = parseInt(interview.time.split(":")[0]);
      
      let timeSlot;
      if (hour < 12) timeSlot = "Morning";
      else if (hour < 16) timeSlot = "Afternoon";
      else if (hour < 20) timeSlot = "Evening";
      else timeSlot = "Night";

      const isPast = date < today;
      
      let status: 'completed' | 'upcoming' | 'cancelled' = interview.status;
      if (status === 'scheduled') {
        status = isPast ? 'completed' : 'upcoming';
      }
      
      return { ...interview, date, dayOfWeek, isWeekend, timeSlot, hour, status };
    });
  };

  const handleAnalyze = () => {
    setError('');
    try {
      const parsed = parseInterviewData(inputData);
      const enriched = enrichInterviews(parsed);
      setParsedInterviews(enriched);
      setShowInput(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleReset = () => {
    setInputData('');
    setParsedInterviews(null);
    setError('');
    setShowInput(true);
  };

  const handleLoadSample = () => {
    setInputData(initialData);
    setError('');
  };

  useEffect(() => {
    // Auto-load initial data on first render
    try {
      const parsed = parseInterviewData(initialData);
      const enriched = enrichInterviews(parsed);
      setParsedInterviews(enriched);
      setShowInput(false);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  if (showInput || !parsedInterviews) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <FileText className="text-blue-600 mr-3" size={32} />
              <h1 className="text-3xl font-bold text-slate-800">Interview Analytics Dashboard</h1>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Paste Interview Data
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Paste your interview data here..."
                className="w-full h-96 p-4 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-2" size={20} />
                  <p className="text-red-700 font-semibold">Error: {error}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Required Format:</h3>
              <pre className="text-sm text-blue-700 font-mono overflow-x-auto">
{`Candidate ID: C14954072
Date: 2025-05-21
Time: 16:00 - 17:00 IST
Candidate ID: C16377895
Date: 2025-07-23
Time: 17:00 - 18:00 IST
Cancelled`}
              </pre>
              <p className="text-sm text-blue-700 mt-2">
                • Each interview needs: Candidate ID, Date (YYYY-MM-DD), and Time<br/>
                • Add "Cancelled" on a new line after cancelled interviews<br/>
                • IST timezone is optional
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAnalyze}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                <TrendingUp className="mr-2" size={20} />
                Analyze Data
              </button>
              <button
                onClick={handleLoadSample}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                <Upload className="mr-2" size={20} />
                Load Sample Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalInterviews = parsedInterviews.length;
  const completedCount = parsedInterviews.filter(i => i.status === "completed").length;
  const upcomingCount = parsedInterviews.filter(i => i.status === "upcoming").length;
  const cancelledCount = parsedInterviews.filter(i => i.status === "cancelled").length;
  const weekdayCount = parsedInterviews.filter(i => !i.isWeekend).length;
  const weekendCount = parsedInterviews.filter(i => i.isWeekend).length;

  // Weekday vs Weekend data
  const weekdayData = [
    { name: 'Weekdays', value: weekdayCount, percentage: ((weekdayCount/totalInterviews)*100).toFixed(1) },
    { name: 'Weekends', value: weekendCount, percentage: ((weekendCount/totalInterviews)*100).toFixed(1) }
  ];

  // Day of week distribution
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayDistribution = dayOrder.map(day => ({
    name: day.slice(0, 3),
    count: parsedInterviews.filter(i => i.dayOfWeek === day).length
  }));

  // Time slot distribution
  const timeSlotData = [
    { name: 'Morning', count: parsedInterviews.filter(i => i.timeSlot === "Morning").length },
    { name: 'Afternoon', count: parsedInterviews.filter(i => i.timeSlot === "Afternoon").length },
    { name: 'Evening', count: parsedInterviews.filter(i => i.timeSlot === "Evening").length },
    { name: 'Night', count: parsedInterviews.filter(i => i.timeSlot === "Night").length }
  ];

  // Monthly trend
  const monthlyData = parsedInterviews.reduce((acc, i) => {
    const month = i.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []);

  // Status data
  const statusData = [
    { name: 'Completed', value: completedCount },
    { name: 'Upcoming', value: upcomingCount },
    { name: 'Cancelled', value: cancelledCount }
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#ef4444'];
  const WEEKDAY_COLORS = ['#6366f1', '#8b5cf6'];

  const openModal = (title: string, data: EnrichedInterview[]) => {
    setModalTitle(title);
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
    setModalTitle('');
  };

  const renderModalContent = () => {
    if (!modalData) return null;

    return (
      <div className="space-y-4">
        {modalData.map((interview, idx) => (
          <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-slate-800 text-lg">{interview.id}</p>
                <p className="text-sm text-slate-600">{interview.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                interview.status === 'completed' ? 'bg-green-100 text-green-700' :
                interview.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Time</p>
                <p className="text-sm text-slate-700 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {interview.time}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Time Slot</p>
                <p className="text-sm text-slate-700">{interview.timeSlot}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Day</p>
                <p className="text-sm text-slate-700">{interview.dayOfWeek}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Type</p>
                <p className="text-sm text-slate-700">{interview.isWeekend ? 'Weekend' : 'Weekday'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Interview Analytics Dashboard</h1>
            <p className="text-slate-600">Comprehensive insights from your interview data</p>
          </div>
          <button
            onClick={handleReset}
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center"
          >
            <RotateCcw className="mr-2" size={18} />
            New Data
          </button>
        </div>

        {/* Modal */}
        {modalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">{modalTitle}</h2>
                <button onClick={closeModal} className="text-white hover:bg-white/20 rounded-full p-2 transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                  <p className="text-sm text-blue-800 font-semibold">
                    Showing {modalData.length} interview{modalData.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {renderModalContent()}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => openModal('All Interviews', parsedInterviews)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Interviews</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{totalInterviews}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
            <p className="text-xs text-blue-600 mt-2">Click to view details</p>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => openModal('Completed Interviews', parsedInterviews.filter(i => i.status === "completed"))}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{completedCount}</p>
                <p className="text-green-600 text-xs mt-1">{((completedCount/totalInterviews)*100).toFixed(1)}% of total</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <p className="text-xs text-green-600 mt-2">Click to view details</p>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => openModal('Upcoming Interviews', parsedInterviews.filter(i => i.status === "upcoming"))}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{upcomingCount}</p>
                {upcomingCount > 0 && (
                  <p className="text-purple-600 text-xs mt-1">
                    Next: {parsedInterviews.find(i => i.status === 'upcoming')?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
              <Calendar className="text-purple-500" size={32} />
            </div>
            <p className="text-xs text-purple-600 mt-2">Click to view details</p>
          </div>

          <div 
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => openModal('Cancelled Interviews', parsedInterviews.filter(i => i.status === "cancelled"))}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Cancelled</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{cancelledCount}</p>
                <p className="text-red-600 text-xs mt-1">{((cancelledCount/totalInterviews)*100).toFixed(1)}% cancellation rate</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <p className="text-xs text-red-600 mt-2">Click to view details</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekday vs Weekend */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekday vs Weekend Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={weekdayData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => {
                    const isWeekend = data.name === 'Weekends';
                    openModal(
                      `${data.name} Interviews`,
                      parsedInterviews.filter(i => i.isWeekend === isWeekend)
                    );
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {weekdayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={WEEKDAY_COLORS[index % WEEKDAY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-indigo-600">{weekdayCount}</span> weekday interviews • 
                <span className="font-semibold text-purple-600 ml-2">{weekendCount}</span> weekend interviews
              </p>
              <p className="text-xs text-blue-600 mt-2">Click on chart sections to view details</p>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Interview Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => {
                    const status = data.name.toLowerCase();
                    openModal(
                      `${data.name} Interviews`,
                      parsedInterviews.filter(i => i.status === status)
                    );
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-blue-600 mt-4 text-center">Click on chart sections to view details</p>
          </div>

          {/* Day of Week Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribution by Day of Week</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => {
                    const fullDayName = dayOrder.find(d => d.startsWith(data.name));
                    openModal(
                      `${fullDayName} Interviews`,
                      parsedInterviews.filter(i => i.dayOfWeek === fullDayName)
                    );
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-blue-600 mt-2 text-center">Click on bars to view details</p>
          </div>

          {/* Time Slot Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferred Time Slots</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSlotData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6" 
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => {
                    openModal(
                      `${data.name} Time Slot Interviews`,
                      parsedInterviews.filter(i => i.timeSlot === data.name)
                    );
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-blue-600 mt-2 text-center">Click on bars to view details</p>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Interview Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 6, cursor: 'pointer' }}
                onClick={(data) => {
                  if (data && data.month) {
                    openModal(
                      `${data.month} Interviews`,
                      parsedInterviews.filter(i => 
                        i.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === data.month
                      )
                    );
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-blue-600 mt-2 text-center">Click on data points to view monthly details</p>
        </div>

        {/* Upcoming Interviews */}
        {upcomingCount > 0 && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="mr-2" size={24} />
              Upcoming Interviews
            </h3>
            <div className="space-y-3">
              {parsedInterviews.filter(i => i.status === "upcoming").map(interview => (
                <div key={interview.id} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{interview.id}</p>
                      <p className="text-sm opacity-90">{interview.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{interview.time}</p>
                      <p className="text-sm opacity-90">{interview.dayOfWeek}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">📊 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedCount > 0 && (
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-semibold text-slate-800">Completion Rate</p>
                <p className="text-sm text-slate-600">{((completedCount/totalInterviews)*100).toFixed(1)}% of interviews completed successfully</p>
              </div>
            )}
            {timeSlotData.sort((a, b) => b.count - a.count)[0].count > 0 && (
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-semibold text-slate-800">Time Preference</p>
                <p className="text-sm text-slate-600">
                  {timeSlotData.sort((a, b) => b.count - a.count)[0].name} slots are most preferred 
                  ({((timeSlotData.sort((a, b) => b.count - a.count)[0].count/totalInterviews)*100).toFixed(1)}%)
                </p>
              </div>
            )}
            {weekendCount > 0 && (
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-semibold text-slate-800">Weekend Activity</p>
                <p className="text-sm text-slate-600">{((weekendCount/totalInterviews)*100).toFixed(1)}% of interviews happen on weekends</p>
              </div>
            )}
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <p className="font-semibold text-slate-800">Cancellation Rate</p>
              <p className="text-sm text-slate-600">
                {cancelledCount === 0 ? 'Perfect! No cancellations' : `${((cancelledCount/totalInterviews)*100).toFixed(1)}% cancellation rate (${cancelledCount} out of ${totalInterviews})`}
              </p>
            </div>
            {dayDistribution.sort((a, b) => b.count - a.count)[0].count > 0 && (
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <p className="font-semibold text-slate-800">Busiest Day</p>
                <p className="text-sm text-slate-600">
                  {dayOrder[dayOrder.findIndex(d => d.startsWith(dayDistribution.sort((a, b) => b.count - a.count)[0].name))]} 
                  {' '}with {dayDistribution.sort((a, b) => b.count - a.count)[0].count} interviews
                </p>
              </div>
            )}
            {monthlyData.length > 1 && (
              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <p className="font-semibold text-slate-800">Activity Span</p>
                <p className="text-sm text-slate-600">
                  {monthlyData.length} months of interview activity tracked
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDashboard;