import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AdminsPage from './pages/AdminsPage';
import UsersPage from './pages/UsersPage';
import ProjectsPage from './pages/ProjectsPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SystemActivitiesPage from './pages/SystemActivitiesPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminProjectsPage from './pages/Admin/AdminProjectsPage';
import AdminTasksPage from './pages/Admin/AdminTasksPage';
import AdminTeamPage from './pages/Admin/AdminTeamPage';
import AdminReportsPage from './pages/Admin/AdminReportsPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import UserDashboard from './pages/Users/UserDashboard';
import UserProjectsPage from './pages/Users/UserProjectsPage';
import UserTasksPage from './pages/Users/UserTasksPage';
import UserNotificationsPage from './pages/Users/UserNotificationsPage';
import UserProfilePage from './pages/Users/UserProfilePage';
import UserSettingsPage from './pages/Users/UserSettingsPage';
import { apiRequest } from './lib/api';
import { applyUserTheme } from './lib/theme';

const dashboardForRole = (role) => {
  if (role === 'Super Admin') return '/super-admin-dashboard';
  if (role === 'Admin') return '/admin-dashboard';
  if (role === 'Member') return '/user-dashboard';
  return '/login';
};

function RequireRole({ role }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem('authToken');
    const savedRole = sessionStorage.getItem('userRole');
    if (!token || !savedRole) {
      setStatus('unauthorized');
      return () => { active = false; };
    }

    apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ user }) => {
      if (!active) return;
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userName', user.fullName);
      sessionStorage.setItem('profilePhoto', user.profilePhoto);
      applyUserTheme(user.theme || 'System');
      setStatus(user.role === role ? 'allowed' : `role:${user.role}`);
    }).catch((error) => {
      if (!active) return;
      if (error.status === 401) {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('profilePhoto');
        setStatus('unauthorized');
      } else {
        setStatus('unavailable');
      }
    });

    return () => { active = false; };
  }, [role]);

  if (status === 'checking') {
    return <div className="p-8 text-center">Checking your session...</div>;
  }
  if (status === 'allowed') return <Outlet />;
  if (status.startsWith('role:')) {
    return <Navigate to={dashboardForRole(status.slice(5))} replace />;
  }
  if (status === 'unavailable') {
    return (
      <div role="alert" className="p-8 text-center">
        <p>Could not verify your session. Please sign in again.</p>
        <Link to="/login" className="text-indigo-600 underline">Go to login</Link>
      </div>
    );
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<RequireRole role="Super Admin" />}>
          <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin-admins" element={<AdminsPage />} />
          <Route path="/super-admin-users" element={<UsersPage />} />
          <Route path="/super-admin-projects" element={<ProjectsPage />} />
          <Route path="/super-admin-reports" element={<ReportsPage />} />
          <Route path="/super-admin-analytics" element={<AnalyticsPage />} />
          <Route path="/super-admin-activities" element={<SystemActivitiesPage />} />
          <Route path="/super-admin-settings" element={<SettingsPage />} />
        </Route>

        <Route element={<RequireRole role="Admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-projects" element={<AdminProjectsPage />} />
          <Route path="/admin-tasks" element={<AdminTasksPage />} />
          <Route path="/admin-team" element={<AdminTeamPage />} />
          <Route path="/admin-reports" element={<AdminReportsPage />} />
          <Route path="/admin-analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin-settings" element={<AdminSettingsPage />} />
        </Route>

        <Route element={<RequireRole role="Member" />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user-projects" element={<UserProjectsPage />} />
          <Route path="/user-tasks" element={<UserTasksPage />} />
          <Route path="/user-notifications" element={<UserNotificationsPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/user-settings" element={<UserSettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}