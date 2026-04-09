import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  initialCompanies,
  initialUsers,
  initialLeads,
  initialDeals,
  initialTasks,
  initialPayments,
  initialAutomations,
  DEFAULT_ROLE_PERMISSIONS,
} from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);

  // ─── DATA STATE ────────────────────────────────────────────────────────────
  const [companies, setCompanies] = useState(initialCompanies);
  const [users, setUsers] = useState(initialUsers);
  const [leads, setLeads] = useState(initialLeads);
  const [deals, setDeals] = useState(initialDeals);
  const [tasks, setTasks] = useState(initialTasks);
  const [payments, setPayments] = useState(initialPayments);
  const [automations, setAutomations] = useState(initialAutomations);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);

  // ─── SUPER ADMIN CREDENTIALS ───────────────────────────────────────────────
  const SUPER_ADMIN = { email: 'owner@trackfield.io', password: 'trackfield123', name: 'TrackField Admin', role: 'super_admin' };

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    // Super admin
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      setCurrentUser({ ...SUPER_ADMIN, id: 'super_admin' });
      setCurrentCompany(null);
      return { success: true, role: 'super_admin' };
    }
    // Company admin or user
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const company = companies.find(c => c.id === user.companyId);
      if (!company) return { success: false, error: 'Company not found' };
      if (company.status === 'inactive') return { success: false, error: 'Your company account is inactive. Contact TrackField support.' };
      if (user.status === 'suspended') return { success: false, error: 'Your account has been suspended.' };
      setCurrentUser(user);
      setCurrentCompany(company);
      return { success: true, role: user.role };
    }
    return { success: false, error: 'Invalid credentials. Please try again.' };
  }, [users, companies]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentCompany(null);
  }, []);

  // ─── PERMISSION CHECK ──────────────────────────────────────────────────────
  const hasPermission = useCallback((module, action = 'view') => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'company_admin') return true;
    const perms = rolePermissions[currentUser.role];
    if (!perms || !perms[module]) return false;
    return perms[module][action] === true;
  }, [currentUser, rolePermissions]);

  // Check if a module is enabled for the current company (admin controls)
  const isModuleEnabled = useCallback((moduleId) => {
    if (!currentCompany) return true;
    return currentCompany.enabledModules?.includes(moduleId) ?? false;
  }, [currentCompany]);

  // ─── COMPANY CRUD ─────────────────────────────────────────────────────────
  const addCompany = (company) => {
    const newCompany = { ...company, id: `c${Date.now()}`, users: 1, leads: 0, revenue: 0 };
    setCompanies(prev => [...prev, newCompany]);
    // Auto-create admin user
    const adminUser = {
      id: `u${Date.now()}`,
      companyId: newCompany.id,
      name: company.adminName,
      email: company.adminEmail,
      password: company.adminPassword || 'admin123',
      role: 'company_admin',
      department: 'Management',
      status: 'active',
      lastLogin: 'Never',
      avatar: company.adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2),
    };
    setUsers(prev => [...prev, adminUser]);
    return newCompany;
  };

  const updateCompany = (id, updates) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (currentCompany?.id === id) setCurrentCompany(prev => ({ ...prev, ...updates }));
  };

  const deleteCompany = (id) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setUsers(prev => prev.filter(u => u.companyId !== id));
  };

  const toggleCompanyStatus = (id) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c));
  };

  // ─── USER CRUD ────────────────────────────────────────────────────────────
  const addUser = (user) => {
    const newUser = {
      ...user,
      id: `u${Date.now()}`,
      status: 'active',
      lastLogin: 'Never',
      avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2),
    };
    setUsers(prev => [...prev, newUser]);
    // Update company user count
    setCompanies(prev => prev.map(c => c.id === user.companyId ? { ...c, users: c.users + 1 } : c));
    return newUser;
  };

  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (user) {
      setCompanies(prev => prev.map(c => c.id === user.companyId ? { ...c, users: Math.max(0, c.users - 1) } : c));
    }
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  // ─── LEADS CRUD ───────────────────────────────────────────────────────────
  const addLead = (lead) => {
    const newLead = { ...lead, id: `l${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], lastContact: 'Today' };
    setLeads(prev => [...prev, newLead]);
    setCompanies(prev => prev.map(c => c.id === lead.companyId ? { ...c, leads: c.leads + 1 } : c));
    return newLead;
  };

  const updateLead = (id, updates) => setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  const deleteLead = (id) => setLeads(prev => prev.filter(l => l.id !== id));

  // ─── DEALS CRUD ───────────────────────────────────────────────────────────
  const addDeal = (deal) => {
    const newDeal = { ...deal, id: `d${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setDeals(prev => [...prev, newDeal]);
    return newDeal;
  };
  const updateDeal = (id, updates) => setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const deleteDeal = (id) => setDeals(prev => prev.filter(d => d.id !== id));

  // ─── TASKS CRUD ───────────────────────────────────────────────────────────
  const addTask = (task) => {
    const newTask = { ...task, id: `t${Date.now()}` };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };
  const updateTask = (id, updates) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // ─── AUTOMATION CRUD ──────────────────────────────────────────────────────
  const addAutomation = (auto) => {
    const newAuto = { ...auto, id: `a${Date.now()}`, runs: 0 };
    setAutomations(prev => [...prev, newAuto]);
  };
  const updateAutomation = (id, updates) => setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const deleteAutomation = (id) => setAutomations(prev => prev.filter(a => a.id !== id));
  const toggleAutomation = (id) => setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: !a.status } : a));

  // ─── MODULE CONTROL (Company Admin) ──────────────────────────────────────
  const toggleCompanyModule = (moduleId) => {
    if (!currentCompany) return;
    const enabled = currentCompany.enabledModules || [];
    const updated = enabled.includes(moduleId)
      ? enabled.filter(m => m !== moduleId)
      : [...enabled, moduleId];
    updateCompany(currentCompany.id, { enabledModules: updated });
  };

  // Update role permissions for a company
  const updateRolePermission = (role, module, action, value) => {
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...(prev[role]?.[module] || {}),
          [action]: value,
        }
      }
    }));
  };

  return (
    <AuthContext.Provider value={{
      currentUser, currentCompany,
      login, logout,
      hasPermission, isModuleEnabled,

      companies, addCompany, updateCompany, deleteCompany, toggleCompanyStatus,
      users, addUser, updateUser, deleteUser, toggleUserStatus,
      leads, addLead, updateLead, deleteLead,
      deals, addDeal, updateDeal, deleteDeal,
      tasks, addTask, updateTask, deleteTask,
      payments, setPayments,
      automations, addAutomation, updateAutomation, deleteAutomation, toggleAutomation,
      rolePermissions, updateRolePermission,
      toggleCompanyModule,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
