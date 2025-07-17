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
import { getCurrentUser } from "./utils/auth";

interface Profile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleLogin = (user: Profile) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
                element={
                  currentUser ? 
                    <Navigate to="/dashboard" replace /> : 
                    <LoginPage onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  currentUser ? 
                    <Navigate to="/dashboard" replace /> : 
                    <RegisterPage />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  currentUser ? 
                    <Dashboard onLogout={handleLogout} currentUser={currentUser} /> : 
                    <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/manual-entry" 
                element={
                  currentUser ? 
                    <ManualTimeEntry /> : 
                    <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/" 
                element={
                  <Navigate to={currentUser ? "/dashboard" : "/login"} replace />
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
