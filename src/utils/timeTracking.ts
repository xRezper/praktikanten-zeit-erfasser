
import { supabase } from "@/integrations/supabase/client";

interface TimeEntry {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  created_at: string;
}

// Speichere System-Startzeit beim ersten Laden
export const initializeSystemStartTime = (): void => {
  if (!localStorage.getItem('timetrack_system_start')) {
    const now = new Date();
    localStorage.setItem('timetrack_system_start', now.toISOString());
    console.log('System start time initialized:', now.toISOString());
  }
};

export const getSystemStartTime = (): string => {
  initializeSystemStartTime();
  const startTimeStr = localStorage.getItem('timetrack_system_start');
  if (startTimeStr) {
    const startTime = new Date(startTimeStr);
    return startTime.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  return '';
};

export const addTimeEntry = async (entry: {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  username?: string;
}): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert([
        {
          user_id: user.id,
          date: entry.date,
          start_time: entry.startTime,
          end_time: entry.endTime,
          description: entry.description
        }
      ]);

    if (error) {
      console.error('Error adding time entry:', error);
      return false;
    }

    console.log('Time entry added successfully:', data);
    return true;
  } catch (error) {
    console.error('Error adding time entry:', error);
    return false;
  }
};

export const getTimeEntries = async (): Promise<TimeEntry[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }

    // Transform to match expected interface
    return (data || []).map(entry => ({
      id: entry.id,
      user_id: entry.user_id,
      date: entry.date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      description: entry.description,
      created_at: entry.created_at
    }));
  } catch (error) {
    console.error('Error getting time entries:', error);
    return [];
  }
};

export const calculateTotalHours = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => {
    const hours = calculateHours(entry.start_time, entry.end_time);
    return total + hours;
  }, 0);
};

export const calculateHours = (startTime: string, endTime: string): number => {
  const start = timeStringToMinutes(startTime);
  const end = timeStringToMinutes(endTime);
  
  let diff = end - start;
  if (diff < 0) {
    diff += 24 * 60; // Über Mitternacht
  }
  
  return diff / 60;
};

export const formatTime = (startTime: string, endTime: string): string => {
  const hours = calculateHours(startTime, endTime);
  return `${hours.toFixed(2)}h`;
};

export const isValidTimeEntry = (date: string, startTime: string, endTime: string): { isValid: boolean; message: string } => {
  // Prüfe ob Endzeit nach Startzeit liegt
  const start = timeStringToMinutes(startTime);
  const end = timeStringToMinutes(endTime);
  
  if (end <= start) {
    return {
      isValid: false,
      message: 'Die Endzeit muss nach der Startzeit liegen'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

// Hilfsfunktionen
const timeStringToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Debug-Funktionen für localStorage (deprecated, aber für Kompatibilität beibehalten)
export const getAllTimeEntries = (): TimeEntry[] => {
  console.warn('getAllTimeEntries is deprecated. Use getTimeEntries() instead.');
  return [];
};

export const clearAllData = (): void => {
  localStorage.removeItem('timetrack_entries');
  localStorage.removeItem('timetrack_system_start');
  console.log('All local time tracking data cleared');
};
