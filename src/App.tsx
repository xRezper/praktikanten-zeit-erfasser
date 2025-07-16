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
import type { User, Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
                element={
                  user ? 
                    <Navigate to="/dashboard" replace /> : 
                    <LoginPage onLogin={() => {}} />
                } 
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
                    <Dashboard onLogout={() => {}} currentUser={user} /> : 
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
                element={
                  <Navigate to={user ? "/dashboard" : "/login"} replace />
                } 
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
