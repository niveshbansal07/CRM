import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Layout from './components/Layout/Layout';

// Super Admin
import SADashboard from './pages/SuperAdmin/Dashboard';
import SACompanies from './pages/SuperAdmin/Companies';
import SAUsers from './pages/SuperAdmin/Users';
import SAPlans from './pages/SuperAdmin/Plans';
import SAAnalytics from './pages/SuperAdmin/Analytics';
import SASystemHealth from './pages/SuperAdmin/SystemHealth';
import SARevenue from './pages/SuperAdmin/Revenue';

// Company Admin
import CADashboard from './pages/CompanyAdmin/Dashboard';
import CAEmployees from './pages/CompanyAdmin/Employees';
import CALeads from './pages/CompanyAdmin/Leads';
import CADeals from './pages/CompanyAdmin/Deals';
import CAModuleControl from './pages/CompanyAdmin/ModuleControl';
import CAAutomation from './pages/CompanyAdmin/Automation';
import CASettings from './pages/CompanyAdmin/Settings';
import CAReports from './pages/CompanyAdmin/Reports';
import CAPayments from './pages/CompanyAdmin/Payments';
import CAContacts from './pages/CompanyAdmin/Contacts';
import CACalendar from './pages/CompanyAdmin/Calendar';

// Super Admin extras
import SAActivityLog from './pages/SuperAdmin/ActivityLog';

// User Dashboard
import UDashboard from './pages/UserDashboard/Dashboard';
import UMyLeads from './pages/UserDashboard/MyLeads';
import UMyDeals from './pages/UserDashboard/MyDeals';
import UTasks from './pages/UserDashboard/Tasks';
import UContacts from './pages/UserDashboard/Contacts';
import UTickets from './pages/UserDashboard/Tickets';
import UProfile from './pages/UserDashboard/Profile';
import UHRMS from './pages/UserDashboard/HRMSUser';
import LeaveManagement from './pages/UserDashboard/LeaveManagement';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  if (currentUser.role === 'company_admin') return <Navigate to="/company/dashboard" replace />;
  return <Navigate to="/user/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* ── SUPER ADMIN ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <Layout role="super_admin" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<SADashboard />} />
        <Route path="companies" element={<SACompanies />} />
        <Route path="users" element={<SAUsers />} />
        <Route path="plans" element={<SAPlans />} />
        <Route path="analytics" element={<SAAnalytics />} />
        <Route path="activity-log" element={<SAActivityLog />} />
        <Route path="system" element={<SASystemHealth />} />
        <Route path="revenue" element={<SARevenue />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ── COMPANY ADMIN ── */}
      <Route path="/company" element={
        <ProtectedRoute allowedRoles={['company_admin']}>
          <Layout role="company_admin" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CADashboard />} />
        <Route path="employees" element={<CAEmployees />} />
        <Route path="leads" element={<CALeads />} />
        <Route path="deals" element={<CADeals />} />
        <Route path="contacts" element={<CAContacts />} />
        <Route path="payments" element={<CAPayments />} />
        <Route path="calendar" element={<CACalendar />} />
        <Route path="automation" element={<CAAutomation />} />
        <Route path="reports" element={<CAReports />} />
        <Route path="leaves" element={<LeaveManagement />} />
        <Route path="modules" element={<CAModuleControl />} />
        <Route path="settings" element={<CASettings />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ── USER DASHBOARD ── */}
      <Route path="/user" element={
        <ProtectedRoute allowedRoles={['sales', 'manager', 'support', 'finance', 'marketing', 'hr', 'operations', 'customer_success', 'legal']}>
          <Layout role="user" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<UDashboard />} />
        <Route path="profile" element={<UProfile />} />
        <Route path="leads" element={<UMyLeads />} />
        <Route path="deals" element={<UMyDeals />} />
        <Route path="tasks" element={<UTasks />} />
        <Route path="contacts" element={<UContacts />} />
        <Route path="tickets" element={<UTickets />} />
        <Route path="hrms" element={<UHRMS />} />
        <Route path="leave-approvals" element={<LeaveManagement />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}