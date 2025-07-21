import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface ProfileData {
  id: string;
  username?: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export const signUp = async (email: string, password: string, username?: string) => {
  try {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username || email.split('@')[0]
        }
      }
    });

    return { data, error };
  } catch (error) {
    return { data: null, error: { message: 'Ein Fehler ist aufgetreten' } };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  } catch (error) {
    return { data: null, error: { message: 'Ein Fehler ist aufgetreten' } };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = (): User | null => {
  return supabase.auth.getUser().then(({ data: { user } }) => user).catch(() => null) as any;
};

export const getCurrentSession = (): Session | null => {
  return supabase.auth.getSession().then(({ data: { session } }) => session).catch(() => null) as any;
};