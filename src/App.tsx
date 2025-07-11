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
import { getCurrentUser } from "./utils/auth";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setIsAuthenticated(!!user);
    setLoading(false);
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
                  isAuthenticated ? 
                    <Navigate to="/dashboard" replace /> : 
                    <LoginPage onLogin={() => setIsAuthenticated(true)} />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? 
                    <Navigate to="/dashboard" replace /> : 
                    <RegisterPage />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated ? 
                    <Dashboard onLogout={() => setIsAuthenticated(false)} /> : 
                    <Navigate to="/login" replace />
                } 
              />
              <Route 
                path="/" 
                element={
                  <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
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
