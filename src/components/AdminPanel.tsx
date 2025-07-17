import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Clock, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

interface TimeEntry {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string | null;
  user_id: string;
}

export function AdminPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [timeEntries, setTimeEntries] = useState<{ [userId: string]: TimeEntry[] }>({});
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTimeEntries = async (userId: string) => {
    try {
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      setTimeEntries(prev => ({
        ...prev,
        [userId]: entriesData || []
      }));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: "Failed to load time entries",
        variant: "destructive",
      });
    }
  };

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (expandedUsers.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
      // Fetch time entries if not already loaded
      if (!timeEntries[userId]) {
        fetchUserTimeEntries(userId);
      }
    }
    setExpandedUsers(newExpanded);
  };

  const calculateTotalHours = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => {
      const start = new Date(`2000-01-01 ${entry.start_time}`);
      const end = new Date(`2000-01-01 ${entry.end_time}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + diff;
    }, 0);
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Admin Panel - All Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profiles.map((profile) => {
            const userEntries = timeEntries[profile.id] || [];
            const totalHours = calculateTotalHours(userEntries);
            const isExpanded = expandedUsers.has(profile.id);

            return (
              <Collapsible key={profile.id} open={isExpanded} onOpenChange={() => toggleUserExpansion(profile.id)}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="font-medium">
                          {profile.first_name && profile.last_name 
                            ? `${profile.first_name} ${profile.last_name}` 
                            : profile.username}
                        </div>
                        <div className="text-sm text-muted-foreground">@{profile.username}</div>
                      </div>
                      <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                        {profile.role}
                      </Badge>
                      {userEntries.length > 0 && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatDuration(totalHours)}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-4 pb-4">
                  {userEntries.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No time entries found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userEntries.map((entry) => {
                          const start = new Date(`2000-01-01 ${entry.start_time}`);
                          const end = new Date(`2000-01-01 ${entry.end_time}`);
                          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                          return (
                            <TableRow key={entry.id}>
                              <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                              <TableCell>{entry.start_time}</TableCell>
                              <TableCell>{entry.end_time}</TableCell>
                              <TableCell>{formatDuration(duration)}</TableCell>
                              <TableCell>{entry.description || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}