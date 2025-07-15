
interface TimeEntry {
  id: string;
  username: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  createdAt: string;
}

const TIME_ENTRIES_KEY = 'timetrack_entries';
const SYSTEM_START_KEY = 'timetrack_system_start';

// Speichere System-Startzeit beim ersten Laden
export const initializeSystemStartTime = (): void => {
  if (!localStorage.getItem(SYSTEM_START_KEY)) {
    const now = new Date();
    localStorage.setItem(SYSTEM_START_KEY, now.toISOString());
    console.log('System start time initialized:', now.toISOString());
  }
};

export const getSystemStartTime = (): string => {
  initializeSystemStartTime();
  const startTimeStr = localStorage.getItem(SYSTEM_START_KEY);
  if (startTimeStr) {
    const startTime = new Date(startTimeStr);
    return startTime.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  return '';
};

export const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt'>): boolean => {
  try {
    const entries = getTimeEntries();
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    
    entries.push(newEntry);
    localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(entries));
    
    console.log('Time entry added:', newEntry);
    return true;
  } catch (error) {
    console.error('Error adding time entry:', error);
    return false;
  }
};

export const getTimeEntries = (): TimeEntry[] => {
  try {
    const entriesStr = localStorage.getItem(TIME_ENTRIES_KEY);
    const allEntries = entriesStr ? JSON.parse(entriesStr) : [];
    
    // Filtere nur Einträge des aktuellen Benutzers
    const currentUser = getCurrentUserFromStorage();
    if (!currentUser) return [];
    
    return allEntries.filter((entry: TimeEntry) => entry.username === currentUser.username);
  } catch (error) {
    console.error('Error getting time entries:', error);
    return [];
  }
};

export const calculateTotalHours = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => {
    const hours = calculateHours(entry.startTime, entry.endTime);
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

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const getCurrentUserFromStorage = (): any => {
  try {
    const userStr = localStorage.getItem('timetrack_current_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user from storage:', error);
    return null;
  }
};

// Debug-Funktionen
export const getAllTimeEntries = (): TimeEntry[] => {
  try {
    const entriesStr = localStorage.getItem(TIME_ENTRIES_KEY);
    return entriesStr ? JSON.parse(entriesStr) : [];
  } catch (error) {
    console.error('Error getting all time entries:', error);
    return [];
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(TIME_ENTRIES_KEY);
  localStorage.removeItem(SYSTEM_START_KEY);
  console.log('All time tracking data cleared');
};
