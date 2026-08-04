import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { MentorDashboard } from './pages/MentorDashboard';
import { HODDashboard } from './pages/HODDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { VisitorDashboard } from './pages/VisitorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { OutpassPage } from './pages/OutpassPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { UserRole } from './types';

// Protected Route Guard with RBAC Role Enforcement
interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          <span>Booting CampusFlow Portal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce Role-Based Access Control
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <UnauthorizedPage allowedRoles={allowedRoles} currentRole={user.role} />
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

// Home Redirect Component: direct logged in user to their dashboard
const HomeRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          <span>Booting CampusFlow Portal...</span>
        </div>
      </div>
    );
  }
  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <LandingPage />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Auth Routes */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Role-Based Dashboards */}
            <Route
              path="/student/*"
              element={
                <ProtectedLayout allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/mentor/*"
              element={
                <ProtectedLayout allowedRoles={['mentor']}>
                  <MentorDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/hod/*"
              element={
                <ProtectedLayout allowedRoles={['hod']}>
                  <HODDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/warden/*"
              element={
                <ProtectedLayout allowedRoles={['warden']}>
                  <WardenDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/security/*"
              element={
                <ProtectedLayout allowedRoles={['security']}>
                  <SecurityDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/visitor/*"
              element={
                <ProtectedLayout allowedRoles={['student', 'security', 'admin']}>
                  <VisitorDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedLayout allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedLayout allowedRoles={['student', 'mentor', 'hod', 'warden', 'security', 'admin']}>
                  <ProfilePage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/outpass"
              element={
                <ProtectedLayout allowedRoles={['student']}>
                  <OutpassPage />
                </ProtectedLayout>
              }
            />

            {/* Fallback */}
            <Route
              path="*"
              element={
                <ProtectedLayout>
                  <NotFoundPage />
                </ProtectedLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
