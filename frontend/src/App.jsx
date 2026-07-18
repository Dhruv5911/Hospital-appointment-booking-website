import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Auth Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Patient Pages
import DashboardHome from './pages/patient/DashboardHome';
import Profile from './pages/patient/Profile';
import Search from './pages/patient/Search';
import AppointmentsPage from './pages/patient/AppointmentsPage';
import HospitalsPage from './pages/patient/HospitalsPage';
import PharmacyPage from './pages/patient/PharmacyPage';
import OrdersPage from './pages/patient/OrdersPage';
import EmergencyPage from './pages/patient/EmergencyPage';
import SymptomsPage from './pages/patient/SymptomsPage';
import LabPage from './pages/patient/LabPage';
import ReportsPage from './pages/patient/ReportsPage';
import PrescriptionsPage from './pages/patient/PrescriptionsPage';
import RemindersPage from './pages/patient/RemindersPage';
import HealthPage from './pages/patient/HealthPage';
import AmbulancePage from './pages/patient/AmbulancePage';
import BloodBankPage from './pages/patient/BloodBankPage';
import BedsPage from './pages/patient/BedsPage';
import FeedbackPage from './pages/patient/FeedbackPage';
import NotificationsPage from './pages/patient/NotificationsPage';
import SettingsPage from './pages/patient/SettingsPage';

// Admin Page (Keeping basic for now, can be expanded later similarly)
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/login" />;
  return children;
}

function PatientLayout() {
  const { user, logout } = useAuth();
  return <DashboardLayout user={user} onLogout={logout} role="patient" />;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Patient Multi-Page Routing */}
        <Route path="/patient" element={<ProtectedRoute role="patient"><PatientLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<Search />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="hospitals" element={<HospitalsPage />} />
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="symptoms" element={<SymptomsPage />} />
          <Route path="lab" element={<LabPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="reminders" element={<RemindersPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="ambulance" element={<AmbulancePage />} />
          <Route path="bloodbank" element={<BloodBankPage />} />
          <Route path="beds" element={<BedsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Route */}
        <Route path="/hospital/*" element={<ProtectedRoute role="hospital_admin"><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
