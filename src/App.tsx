import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";
import ManualTimeEntry from "./components/ManualTimeEntry";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

interface ProfileData {
  id: string;
  username?: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id);
          // Fetch user profile
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('Profile data:', profileData, 'Error:', error);
            setProfile(profileData);
          } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          }
        } else {
          console.log('No session, clearing profile');
          setProfile(null);
        }
        
        console.log('Setting loading to false');
        setLoading(false);
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      console.log('Getting initial session');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Fetching initial profile for user:', session.user.id);
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          console.log('Initial profile data:', profileData, 'Error:', error);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        console.log('Initial session check complete, setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // Navigate to dashboard after successful login
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Lade...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route 
                path="/login" 
                element={<LoginPage onLogin={handleLogin} />} 
              />
              <Route 
                path="/register" 
                element={
                  user ? 
                    <Navigate to="/dashboard" replace /> : 
                    <RegisterPage />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  user ? 
                    (profile ? 
                      <Dashboard onLogout={handleLogout} currentUser={profile} /> : 
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-xl">Lade Profil...</div>
                      </div>
                    ) : 
                    <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/manual-entry" 
                element={
                  user ? 
                    <ManualTimeEntry /> : 
                    <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to="/login" replace />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
