
interface User {
  username: string;
  password: string;
  createdAt: string;
}

const USERS_KEY = 'timetrack_users';
const CURRENT_USER_KEY = 'timetrack_current_user';

export const register = async (username: string, password: string): Promise<boolean> => {
  try {
    const users = getUsers();
    
    // Prüfen ob Benutzername bereits existiert
    if (users.find(user => user.username === username)) {
      return false;
    }

    const newUser: User = {
      username,
      password, // In einer echten App würde man das Passwort hashen
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    console.log('User registered successfully:', username);
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

export const login = async (username: string, password: string): Promise<boolean> => {
  try {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        username: user.username,
        loginTime: new Date().toISOString()
      }));
      console.log('User logged in successfully:', username);
      return true;
    }
    
    console.log('Login failed for user:', username);
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
  console.log('User logged out');
};

export const getCurrentUser = (): any => {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

const getUsers = (): User[] => {
  try {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Debug-Funktion zum Anzeigen aller Benutzer
export const getAllUsers = (): User[] => {
  return getUsers();
};
