import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  user: any | null;
  loading: boolean;
}

interface ProfileData {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  password_hash?: string;
}

export const signUp = async (username: string, password: string) => {
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return { data: null, error: { message: 'Benutzername bereits vergeben' } };
    }

    // Create user record in profiles table
    const userId = crypto.randomUUID();
    const insertData = {
      id: userId,
      username,
      password_hash: password, // In production, this should be properly hashed
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: { user: data }, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Ein Fehler ist aufgetreten' } };
  }
};

export const signIn = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, role, created_at, password_hash')
      .eq('username', username)
      .eq('password_hash', password)
      .maybeSingle();

    if (error || !data) {
      return { data: null, error: { message: 'Benutzername oder Passwort falsch' } };
    }

    // Store user session in localStorage
    localStorage.setItem('current_user', JSON.stringify(data));
    
    return { data: { user: data }, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Ein Fehler ist aufgetreten' } };
  }
};

export const signOut = async () => {
  localStorage.removeItem('current_user');
  return { error: null };
};

export const getCurrentUser = (): ProfileData | null => {
  try {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};