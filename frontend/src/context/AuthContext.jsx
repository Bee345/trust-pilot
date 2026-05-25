import { createContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../lib/socket';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

function initUser() {
  const stored = localStorage.getItem('trustbase_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function initAuth() {
  const token = localStorage.getItem('trustbase_token');
  if (!token) return false;
  const stored = localStorage.getItem('trustbase_user');
  if (!stored) return false;
  try {
    JSON.parse(stored);
    return true;
  } catch {
    localStorage.removeItem('trustbase_token');
    localStorage.removeItem('trustbase_user');
    return false;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(initUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initAuth);

  useEffect(() => {
    const token = localStorage.getItem('trustbase_token');
    if (token) connectSocket(token);
  }, []);

  function login(userData, token) {
    localStorage.setItem('trustbase_token', token);
    localStorage.setItem('trustbase_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    connectSocket(token);
  }

  function logout() {
    localStorage.removeItem('trustbase_token');
    localStorage.removeItem('trustbase_user');
    setUser(null);
    setIsAuthenticated(false);
    disconnectSocket();
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading: false, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
