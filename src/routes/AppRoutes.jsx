import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AssetInventoryPage from '../pages/AssetInventoryPage';
import AssetDetailsPage from '../pages/AssetDetailsPage';
import CloudAccountsPage from '../pages/CloudAccountsPage';
import ResourceExplorerPage from '../pages/ResourceExplorerPage';
import SecurityPage from '../pages/SecurityPage';
import AlertsPage from '../pages/AlertsPage';
import ActivityPage from '../pages/ActivityPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="assets" element={<AssetInventoryPage />} />
        <Route path="assets/:id" element={<AssetDetailsPage />} />
        <Route path="cloud-accounts" element={<CloudAccountsPage />} />
        <Route path="explorer" element={<ResourceExplorerPage />} />
        <Route path="security" element={<SecurityPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
