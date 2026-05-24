import { createContext, useState, useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../lib/socket';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('trustbase_token');
    const stored = localStorage.getItem('trustbase_user');
    if (token && stored) {
      Promise.resolve().then(() => {
        setUser(JSON.parse(stored));
        setIsAuthenticated(true);
        connectSocket(token);
      });
    }
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
