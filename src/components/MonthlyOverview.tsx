import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTimeEntries, calculateHours } from '@/utils/timeTracking';

interface TimeEntry {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  created_at: string;
}

interface DayData {
  date: string;
  hours: number;
  entries: TimeEntry[];
}

interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  days: DayData[];
}

const MonthlyOverview: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    const entries = await getTimeEntries();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Filter entries for current month
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    // Group by weeks
    const weeks: WeekData[] = [];
    const monthTotal = monthEntries.reduce((total, entry) => {
      return total + calculateHours(entry.start_time, entry.end_time);
    }, 0);

    // Get all days in month
    const daysInMonth = monthEnd.getDate();
    const daysData: DayData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const dayEntries = monthEntries.filter(entry => entry.date === dateString);
      const dayHours = dayEntries.reduce((total, entry) => {
        return total + calculateHours(entry.start_time, entry.end_time);
      }, 0);

      daysData.push({
        date: dateString,
        hours: dayHours,
        entries: dayEntries
      });
    }

    // Group days by weeks
    let currentWeek: DayData[] = [];
    let weekNumber = 1;

    daysData.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      
      // Start new week on Monday (1) or first day of month
      if ((dayOfWeek === 1 && currentWeek.length > 0) || index === daysInMonth - 1) {
        if (currentWeek.length > 0) {
          const weekHours = currentWeek.reduce((total, d) => total + d.hours, 0);
          weeks.push({
            weekNumber,
            startDate: currentWeek[0].date,
            endDate: currentWeek[currentWeek.length - 1].date,
            totalHours: weekHours,
            days: [...currentWeek]
          });
          weekNumber++;
        }
        currentWeek = [day];
      } else {
        currentWeek.push(day);
      }
    });

    // Add last week if not empty
    if (currentWeek.length > 0) {
      const weekHours = currentWeek.reduce((total, d) => total + d.hours, 0);
      weeks.push({
        weekNumber,
        startDate: currentWeek[0].date,
        endDate: currentWeek[currentWeek.length - 1].date,
        totalHours: weekHours,
        days: currentWeek
      });
    }

    setWeekData(weeks);
    setMonthlyTotal(monthTotal);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', { 
      day: '2-digit',
      month: '2-digit'
    });
  };

  const monthName = currentDate.toLocaleDateString('de-DE', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6" />
            <CardTitle>Monatsübersicht - {monthName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-xl font-semibold">
              Gesamtstunden im Monat: {monthlyTotal.toFixed(2)}h
            </div>
          </div>

          <div className="space-y-6">
            {weekData.map((week) => (
              <Card key={week.weekNumber} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Woche {week.weekNumber} ({formatDate(week.startDate)} - {formatDate(week.endDate)})
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Gesamt: {week.totalHours.toFixed(2)}h
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    {week.days.map((day) => (
                      <div
                        key={day.date}
                        className={`p-3 rounded-lg border ${
                          day.hours > 0 
                            ? 'bg-primary/5 border-primary/20' 
                            : 'bg-muted/50 border-muted'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString('de-DE', { 
                            weekday: 'short',
                            day: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.hours > 0 ? `${day.hours.toFixed(2)}h` : '0h'}
                        </div>
                        {day.entries.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {day.entries.length} Eintrag{day.entries.length > 1 ? 'e' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {weekData.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Keine Zeiteinträge für diesen Monat gefunden.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyOverview;