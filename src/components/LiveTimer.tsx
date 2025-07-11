
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  Square,
  Timer
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { addTimeEntry } from '../utils/timeTracking';
import { toast } from 'sonner';

interface LiveTimerProps {
  onTimeAdded: () => void;
}

const LiveTimer: React.FC<LiveTimerProps> = ({ onTimeAdded }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, startTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
    setShowDescriptionInput(false);
    toast.success('Timer gestartet!');
  };

  const handlePause = () => {
    setIsRunning(false);
    toast.info('Timer pausiert');
  };

  const handleStop = () => {
    if (!startTime) return;
    
    setIsRunning(false);
    setShowDescriptionInput(true);
    toast.info('Timer gestoppt - Bitte Tätigkeit eingeben');
  };

  const handleSave = async () => {
    if (!startTime || !description.trim()) {
      toast.error('Bitte geben Sie eine Tätigkeit ein');
      return;
    }

    const endTime = new Date();
    const entry = {
      date: startTime.toISOString().split('T')[0],
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      description: description.trim(),
      username: currentUser?.username
    };

    const success = addTimeEntry(entry);
    
    if (success) {
      toast.success('Arbeitszeit erfolgreich gespeichert!');
      // Reset timer
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');
      setShowDescriptionInput(false);
      onTimeAdded();
    } else {
      toast.error('Fehler beim Speichern der Arbeitszeit');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setDescription('');
    setShowDescriptionInput(false);
    toast.info('Timer zurückgesetzt');
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Live Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-gray-500">
            {isRunning ? 'Timer läuft...' : 'Timer gestoppt'}
          </div>
        </div>

        {/* Description Input - only show after stopping */}
        {showDescriptionInput && (
          <div className="space-y-2">
            <Label htmlFor="timer-description">Was haben Sie gemacht?</Label>
            <Textarea
              id="timer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie Ihre Tätigkeit..."
              rows={3}
            />
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex gap-2">
          {!isRunning && elapsedTime === 0 && !showDescriptionInput && (
            <Button 
              onClick={handleStart} 
              className="flex-1 flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
          )}
          
          {isRunning && (
            <>
              <Button 
                onClick={handlePause} 
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button 
                onClick={handleStop} 
                className="flex-1 flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          
          {!isRunning && elapsedTime > 0 && !showDescriptionInput && (
            <>
              <Button 
                onClick={handleStart} 
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Weiter
              </Button>
              <Button 
                onClick={handleStop} 
                className="flex-1 flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop
              </Button>
            </>
          )}

          {showDescriptionInput && (
            <>
              <Button 
                onClick={handleSave} 
                className="flex-1 flex items-center gap-2"
                disabled={!description.trim()}
              >
                Speichern
              </Button>
              <Button 
                onClick={handleReset} 
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                Abbrechen
              </Button>
            </>
          )}
          
          {elapsedTime > 0 && !showDescriptionInput && (
            <Button 
              onClick={handleReset} 
              variant="destructive"
              size="sm"
            >
              Reset
            </Button>
          )}
        </div>

        {startTime && (
          <div className="text-sm text-gray-500 text-center">
            Gestartet um: {startTime.toLocaleTimeString('de-DE')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveTimer;
