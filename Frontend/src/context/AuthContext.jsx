import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  initialCompanies,
  initialUsers,
  initialLeads,
  initialDeals,
  initialTasks,
  initialPayments,
  initialAutomations,
  initialTickets,
  initialLeaves,
  initialAttendance,
  DEFAULT_ROLE_PERMISSIONS,
} from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(true); // ← prevents flash of login page

  // ─── RESTORE SESSION FROM LOCALSTORAGE ON APP START ───────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const companyStr = localStorage.getItem('company');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        if (companyStr) setCurrentCompany(JSON.parse(companyStr));
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
      }
    }
    setLoading(false);
  }, []);

  // ─── DATA STATE (unchanged) ───────────────────────────────────────────────
  const [companies, setCompanies] = useState(() => initialCompanies.map(c => ({
    ...c,
    enabledModules: c.enabledModules?.includes('hrms') ? c.enabledModules : [...(c.enabledModules || []), 'hrms']
  })));
  const [users, setUsers] = useState(() => initialUsers.map(u => ({
    ...u,
    joiningDate: u.joiningDate || '2024-01-10',
    employeeId: u.employeeId || 'EMP-' + u.id.replace('u', '').padStart(3, '0'),
    verificationStatus: u.verificationStatus !== undefined ? u.verificationStatus : true,
    documents: u.documents || [{ name: 'Resume.pdf', type: 'resume' }, { name: 'ID_Proof.pdf', type: 'id' }],
    offerLetter: u.offerLetter || 'Offer_Letter.pdf'
  })));
  const [leads, setLeads] = useState(initialLeads);
  const [deals, setDeals] = useState(initialDeals);
  const [tasks, setTasks] = useState(initialTasks);
  const [payments, setPayments] = useState(initialPayments);
  const [automations, setAutomations] = useState(initialAutomations);
  const [tickets, setTickets] = useState(initialTickets);
  const [leaves, setLeaves] = useState(initialLeaves);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [rolePermissions, setRolePermissions] = useState(() => {
    const perms = JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
    Object.keys(perms).forEach(role => {
      perms[role].hrms = { view: true, create: true, edit: ['hr', 'manager', 'company_admin'].includes(role), delete: false };
    });
    return perms;
  });

  // ─── LOGIN (with localStorage persistence) ─────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.message || 'Login failed' };
      }

      const { token, role, user, company } = data.data;

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, role }));
      if (company) localStorage.setItem('company', JSON.stringify(company));

      // Update React state
      setCurrentUser({ ...user, role });
      setCurrentCompany(company || null);

      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error – cannot reach server' };
    }
  }, []);

  // ─── LOGOUT (clear everything) ────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    setCurrentUser(null);
    setCurrentCompany(null);
  }, []);

  // ─── PERMISSION CHECK (unchanged) ─────────────────────────────────────────
  const hasPermission = useCallback((module, action = 'view') => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'company_admin') return true;
    const perms = rolePermissions[currentUser.role];
    if (!perms || !perms[module]) return false;
    return perms[module][action] === true;
  }, [currentUser, rolePermissions]);

  const isModuleEnabled = useCallback((moduleId) => {
    if (!currentCompany) return true;
    return currentCompany.enabledModules?.includes(moduleId) ?? false;
  }, [currentCompany]);

  // ─── COMPANY CRUD (unchanged) ─────────────────────────────────────────────
  const addCompany = (company) => {
    const newCompany = { ...company, id: `c${Date.now()}`, users: 1, leads: 0, revenue: 0 };
    setCompanies(prev => [...prev, newCompany]);
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
      avatar: company.adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
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

  // ─── USER CRUD (unchanged) ────────────────────────────────────────────────
  const addUser = (user) => {
    const newUser = {
      ...user,
      id: `u${Date.now()}`,
      status: 'active',
      lastLogin: 'Never',
      avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
    setUsers(prev => [...prev, newUser]);
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

  // ─── LEADS CRUD (unchanged) ───────────────────────────────────────────────
  const addLead = (lead) => {
    const newLead = { ...lead, id: `l${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], lastContact: 'Today' };
    setLeads(prev => [...prev, newLead]);
    setCompanies(prev => prev.map(c => c.id === lead.companyId ? { ...c, leads: c.leads + 1 } : c));
    return newLead;
  };

  const updateLead = (id, updates) => setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  const deleteLead = (id) => setLeads(prev => prev.filter(l => l.id !== id));

  // ─── DEALS CRUD (unchanged) ───────────────────────────────────────────────
  const addDeal = (deal) => {
    const newDeal = { ...deal, id: `d${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    setDeals(prev => [...prev, newDeal]);
    return newDeal;
  };
  const updateDeal = (id, updates) => setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  const deleteDeal = (id) => setDeals(prev => prev.filter(d => d.id !== id));

  // ─── TASKS CRUD (unchanged) ───────────────────────────────────────────────
  const addTask = (task) => {
    const newTask = { ...task, id: `t${Date.now()}` };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };
  const updateTask = (id, updates) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  // ─── AUTOMATION CRUD (unchanged) ──────────────────────────────────────────
  const addAutomation = (auto) => {
    const newAuto = { ...auto, id: `a${Date.now()}`, runs: 0 };
    setAutomations(prev => [...prev, newAuto]);
  };
  const updateAutomation = (id, updates) => setAutomations(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const deleteAutomation = (id) => setAutomations(prev => prev.filter(a => a.id !== id));
  const toggleAutomation = (id) => setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: !a.status } : a));

  // ─── TICKETS CRUD (unchanged) ─────────────────────────────────────────────
  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: `tk${Date.now()}`,
      created: new Date().toISOString().split('T')[0],
      status: 'open',
      companyId: currentCompany?.id,
      createdBy: currentUser?.id,
      createdByName: currentUser?.name,
      resolvedBy: null,
      resolvedAt: null,
      comment: '',
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };
  const updateTicket = (id, updates) => setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTicket = (id) => setTickets(prev => prev.filter(t => t.id !== id));
  const resolveTicket = (id, comment) => setTickets(prev => prev.map(t =>
    t.id === id ? { ...t, status: 'resolved', resolvedBy: currentUser?.id, resolvedByName: currentUser?.name, resolvedAt: new Date().toISOString().split('T')[0], comment } : t
  ));

  // ─── HRMS CRUD (unchanged) ────────────────────────────────────────────────
  const addLeave = (leave) => {
    const newLeave = {
      ...leave,
      id: `lv${Date.now()}`,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'pending',
      companyId: currentCompany?.id,
      userId: currentUser?.id,
    };
    setLeaves(prev => [newLeave, ...prev]);
    return newLeave;
  };
  const updateLeave = (id, updates) => setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

  const addAttendance = (record) => {
    const newRecord = {
      ...record,
      id: `at${Date.now()}`,
      userId: currentUser?.id,
      date: new Date().toISOString().split('T')[0],
    };
    setAttendance(prev => [newRecord, ...prev]);
    return newRecord;
  };
  const updateAttendance = (id, updates) => setAttendance(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));

  // ─── MODULE & PERMISSION CONTROLS (unchanged) ─────────────────────────────
  const toggleCompanyModule = (moduleId) => {
    if (!currentCompany) return;
    const enabled = currentCompany.enabledModules || [];
    const updated = enabled.includes(moduleId)
      ? enabled.filter(m => m !== moduleId)
      : [...enabled, moduleId];
    updateCompany(currentCompany.id, { enabledModules: updated });
  };

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

  // Show loading indicator while restoring session
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
      tickets, addTicket, updateTicket, deleteTicket, resolveTicket,
      leaves, addLeave, updateLeave,
      attendance, addAttendance, updateAttendance,
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