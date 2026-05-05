import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout Components
import BottomNav from './components/BottomNav';

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ReportsList from './pages/ReportsList';
import ReportScam from './pages/ReportScam';
import VerifiedProfile from './pages/VerifiedProfile';
import GetVerified from './pages/GetVerified';
import VerificationStatus from './pages/VerificationStatus';
import MyReports from './pages/MyReports';
import More from './pages/More';
import Notifications from './pages/Notifications';
import PrivacySecurity from './pages/PrivacySecurity';
import PrivacySettings from './pages/PrivacySettings';
import Profile from './pages/Profile';

// Pages that should NOT show the bottom nav
const NO_NAV_PATHS = ['/signup', '/login'];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
}

function AppContent({ isAuthenticated, setIsAuthenticated }) {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />

        {/* Protected Routes */}
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/signup" />} />
        <Route path="/search-results" element={isAuthenticated ? <SearchResults /> : <Navigate to="/signup" />} />
        <Route path="/reports-list" element={isAuthenticated ? <ReportsList /> : <Navigate to="/signup" />} />
        <Route path="/report-scam" element={isAuthenticated ? <ReportScam /> : <Navigate to="/signup" />} />
        <Route path="/verified-profile" element={isAuthenticated ? <VerifiedProfile /> : <Navigate to="/signup" />} />
        <Route path="/get-verified" element={isAuthenticated ? <GetVerified /> : <Navigate to="/signup" />} />
        <Route path="/verification-status" element={isAuthenticated ? <VerificationStatus /> : <Navigate to="/signup" />} />
        <Route path="/my-reports" element={isAuthenticated ? <MyReports /> : <Navigate to="/signup" />} />
        <Route path="/more" element={isAuthenticated ? <More /> : <Navigate to="/signup" />} />
        <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/signup" />} />
        <Route path="/privacy-security" element={isAuthenticated ? <PrivacySecurity /> : <Navigate to="/signup" />} />
        <Route path="/privacy-settings" element={isAuthenticated ? <PrivacySettings /> : <Navigate to="/signup" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/signup" />} />

        {/* Default route */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/signup'} />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/signup'} />} />
      </Routes>
      {isAuthenticated && <BottomNav />}
    </>
  );
}

export default App;
