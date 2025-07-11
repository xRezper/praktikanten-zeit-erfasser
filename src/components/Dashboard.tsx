
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  Plus, 
  LogOut, 
  Calendar, 
  Timer, 
  User,
  AlertCircle,
  CheckCircle,
  History
} from 'lucide-react';
import { getCurrentUser, logout } from '../utils/auth';
import { 
  getTimeEntries, 
  addTimeEntry, 
  calculateTotalHours,
  formatTime,
  getSystemStartTime,
  isValidTimeEntry
} from '../utils/timeTracking';
import { toast } from 'sonner';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [systemStartTime, setSystemStartTime] = useState<string>('');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadTimeEntries();
    setSystemStartTime(getSystemStartTime());
  }, []);

  const loadTimeEntries = () => {
    const entries = getTimeEntries();
    setTimeEntries(entries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validierung der Zeitangaben
      const validation = isValidTimeEntry(
        formData.date,
        formData.startTime,
        formData.endTime
      );

      if (!validation.isValid) {
        toast.error(validation.message);
        setLoading(false);
        return;
      }

      const entry = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        username: currentUser?.username
      };

      const success = addTimeEntry(entry);
      
      if (success) {
        toast.success('Zeiteintrag erfolgreich hinzugefügt!');
        loadTimeEntries();
        setFormData({
          date: new Date().toISOString().split('T')[0],
          startTime: '',
          endTime: '',
          description: ''
        });
      } else {
        toast.error('Fehler beim Hinzufügen des Zeiteintrags');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          {/* Zeiteintrag hinzufügen */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Neue Arbeitszeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Datum</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start</Label>
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Ende</Label>
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Tätigkeit</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Beschreiben Sie Ihre Arbeit..."
                      required
                      rows={3}
                    />
                  </div>

                  {systemStartTime && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        PC-Start heute: {systemStartTime}
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Zeiten vor dem PC-Start können nicht eingetragen werden.
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Speichern...' : 'Zeit hinzufügen'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Statistiken */}
            <Card className="shadow-sm mt-6">
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
                    <p className="text-sm">Fügen Sie Ihren ersten Eintrag hinzu!</p>
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
