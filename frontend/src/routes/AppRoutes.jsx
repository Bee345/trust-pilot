import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Signup from '../pages/Signup';
import Login from '../pages/Login';
import Home from '../pages/Home';
import SearchResults from '../pages/SearchResults';
import ReportsList from '../pages/ReportsList';
import ReportScam from '../pages/ReportScam';
import VerifiedProfile from '../pages/VerifiedProfile';
import GetVerified from '../pages/GetVerified';
import VerificationStatus from '../pages/VerificationStatus';
import MyReports from '../pages/MyReports';
import More from '../pages/More';
import Notifications from '../pages/Notifications';
import PrivacySecurity from '../pages/PrivacySecurity';
import PrivacySettings from '../pages/PrivacySettings';
import Profile from '../pages/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/reports-list" element={<ReportsList />} />
        <Route path="/report-scam" element={<ReportScam />} />
        <Route path="/verified-profile" element={<VerifiedProfile />} />
        <Route path="/get-verified" element={<GetVerified />} />
        <Route path="/verification-status" element={<VerificationStatus />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/more" element={<More />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/privacy-security" element={<PrivacySecurity />} />
        <Route path="/privacy-settings" element={<PrivacySettings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
