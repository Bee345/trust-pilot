import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import BottomNav from './components/BottomNav';
import './App.css';

function AppInner() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <AppRoutes />
      {isAuthenticated && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}
