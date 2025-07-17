
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Mail, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { signUp } from '../utils/auth';
import { toast } from 'sonner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await signUp(formData.username, formData.password);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('E-Mail bereits registriert');
        } else {
          setError(signUpError.message);
        }
      } else {
        toast.success('Konto erfolgreich erstellt!');
        navigate('/login');
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Konto erstellen
          </h1>
          <p className="text-gray-600">
            Erstellen Sie Ihr Konto für die Zeiterfassung
          </p>
        </div>

        {/* Register Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">Registrieren</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Benutzername
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Wählen Sie einen Benutzernamen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Passwort
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Mindestens 6 Zeichen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Passwort bestätigen
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11"
                  placeholder="Passwort wiederholen"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-green-600 hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Konto wird erstellt...' : 'Konto erstellen'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Bereits ein Konto?{' '}
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  Hier anmelden
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
