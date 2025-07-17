
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Plus, 
  LogOut, 
  Calendar, 
  Timer, 
  User,
  History,
  Edit,
  Target,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../utils/auth';
import { 
  getTimeEntries, 
  calculateTotalHours,
  formatTime
} from '../utils/timeTracking';
import { toast } from 'sonner';
import LiveTimer from './LiveTimer';
import { AdminPanel } from './AdminPanel';
import { Shield } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

interface DashboardProps {
  onLogout: () => void;
  currentUser: Profile;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentUser }) => {
  const navigate = useNavigate();
  const [timeEntries, setTimeEntries] = useState<any[]>([]);

  useEffect(() => {
    loadTimeEntries();
  }, []);

  const loadTimeEntries = () => {
    const entries = getTimeEntries();
    setTimeEntries(entries);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Fehler beim Abmelden');
    } else {
      onLogout();
      toast.success('Erfolgreich abgemeldet');
    }
  };

  const groupedEntries = timeEntries.reduce((groups: any, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

  // Get current week (Monday to Friday)
  const getCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Handle Sunday (0) and get Monday
    monday.setDate(today.getDate() + diff);
    
    const weekDays = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day.toISOString().split('T')[0]);
    }
    return weekDays;
  };

  const currentWeekDays = getCurrentWeek();
  const currentWeekEntries = timeEntries.filter(entry => 
    currentWeekDays.includes(entry.date)
  );
  const currentWeekHours = calculateTotalHours(currentWeekEntries);
  const weekProgress = (currentWeekHours / 40) * 100;

  const totalHours = calculateTotalHours(timeEntries);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Zeiterfassung Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{currentUser?.username || 'Benutzer'}</span>
                {currentUser?.role === 'admin' && (
                  <Shield className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer und Aktionen */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Timer */}
            <LiveTimer onTimeAdded={loadTimeEntries} />

            {/* Manual Entry Button */}
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <Button 
                  onClick={() => navigate('/manual-entry')}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Zeit nachtragen
                </Button>
              </CardContent>
            </Card>

            {/* Wochenziel Statistiken */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Wochenziel (40h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Diese Woche:</span>
                    <span className="font-semibold text-lg">{currentWeekHours.toFixed(2)}h / 40h</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        weekProgress >= 100 
                          ? 'bg-green-500' 
                          : weekProgress >= 75 
                          ? 'bg-yellow-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(weekProgress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{weekProgress.toFixed(1)}% erreicht</span>
                    <span className={`font-medium ${
                      weekProgress >= 100 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {weekProgress >= 100 ? 'Ziel erreicht!' : `${(40 - currentWeekHours).toFixed(2)}h verbleibend`}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Gesamtstunden:</span>
                      <span>{totalHours.toFixed(2)}h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel */}
            {currentUser?.role === 'admin' && (
              <AdminPanel />
            )}
          </div>

          {/* Zeiteinträge Liste - nur aktuelle Woche */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Diese Woche (Mo-Fr)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentWeekEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Zeiteinträge diese Woche.</p>
                    <p className="text-sm">Starten Sie den Timer oder tragen Sie Zeit nach!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentWeekDays.map(date => {
                      const dayEntries = currentWeekEntries.filter(entry => entry.date === date);
                      if (dayEntries.length === 0) return null;
                      
                      const dayHours = calculateTotalHours(dayEntries);
                      return (
                        <div key={date} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <h3 className="font-semibold text-gray-900">
                                {new Date(date).toLocaleDateString('de-DE', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </h3>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              dayHours >= 8 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {dayHours.toFixed(2)}h
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {dayEntries.map((entry, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <Clock className="h-3 w-3" />
                                      {entry.startTime} - {entry.endTime}
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      {formatTime(entry.startTime, entry.endTime)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm">{entry.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
