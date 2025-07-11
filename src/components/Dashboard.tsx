
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
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';
import { 
  getTimeEntries, 
  calculateTotalHours,
  formatTime
} from '../utils/timeTracking';
import { toast } from 'sonner';
import LiveTimer from './LiveTimer';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadTimeEntries();
  }, []);

  const loadTimeEntries = () => {
    const entries = getTimeEntries();
    setTimeEntries(entries);
  };

  const handleLogout = () => {
    logout();
    onLogout();
    toast.success('Erfolgreich abgemeldet');
  };

  const groupedEntries = timeEntries.reduce((groups: any, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});

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
                <span className="font-medium">{currentUser?.username}</span>
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

            {/* Statistiken */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Statistiken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gesamtstunden:</span>
                    <span className="font-semibold text-lg">{totalHours.toFixed(2)}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Einträge gesamt:</span>
                    <span className="font-semibold">{timeEntries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Arbeitstage:</span>
                    <span className="font-semibold">{Object.keys(groupedEntries).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zeiteinträge Liste */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Arbeitszeiten Übersicht
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedEntries).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Zeiteinträge vorhanden.</p>
                    <p className="text-sm">Starten Sie den Timer oder tragen Sie Zeit nach!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedEntries)
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([date, entries]: [string, any[]]) => {
                        const dayHours = calculateTotalHours(entries);
                        return (
                          <div key={date} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <h3 className="font-semibold text-gray-900">
                                  {new Date(date).toLocaleDateString('de-DE', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </h3>
                              </div>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                                {dayHours.toFixed(2)}h
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {entries.map((entry, index) => (
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
