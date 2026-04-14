import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
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
import { API_BASE_URL, authHeaders } from "../utils/api";

const AuthContext = createContext(null);

const normalizeCompany = (company) => {
  if (!company) return null;

  return {
    id: company.id || company._id,
    name: company.name || '',
    domain: company.domain || company.slug || '',
    industry: company.industry || 'Other',
    plan: company.plan || 'free',
    status: company.status || 'active',
    users: company.users ?? 0,
    leads: company.leads ?? 0,
    revenue: company.revenue ?? 0,
    adminName: company.adminName || '',
    adminEmail: company.adminEmail || '',
    enabledModules: Array.isArray(company.enabledModules) ? company.enabledModules : [],
    joinedDate: company.joinedDate || company.createdAt || '',
  };
};

const normalizeUser = (user) => {
  if (!user) return null;

  const fullName = user.fullName || user.name || '';

  return {
    id: user.id || user._id,
    companyId: user.companyId || null,
    fullName,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'user',
    department: user.department || '',
    designation: user.designation || '',
    employeeId: user.employeeId || '',
    status: user.status || 'active',
    isEmailVerified: user.isEmailVerified ?? false,
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    avatar:
      user.avatar ||
      fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
  };
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Production data from backend
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  // Temporary mock fallback for modules not yet backed by API
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
    Object.keys(perms).forEach((role) => {
      perms[role].hrms = {
        view: true,
        create: true,
        edit: ['hr', 'manager', 'company_admin'].includes(role),
        delete: false,
      };
    });
    return perms;
  });

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'GET',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return;
      }

      const list = Array.isArray(data?.data?.companies) ? data.data.companies : [];
      setCompanies(list.map(normalizeCompany));
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return;
      }

      const list = Array.isArray(data?.data?.users) ? data.data.users : [];
      setUsers(list.map(normalizeUser));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const bootstrapAppData = useCallback(async () => {
    await Promise.allSettled([fetchCompanies(), fetchUsers()]);
  }, [fetchCompanies, fetchUsers]);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: authHeaders(),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Session restore failed');
        }

        const user = normalizeUser(data?.data?.user);
        const company = normalizeCompany(data?.data?.company);

        setCurrentUser(user);
        setCurrentCompany(company || null);

        localStorage.setItem('user', JSON.stringify(user));
        if (company) {
          localStorage.setItem('company', JSON.stringify(company));
        } else {
          localStorage.removeItem('company');
        }

        await bootstrapAppData();
      } catch (err) {
        console.error('Failed to restore session:', err);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('company');

        setCurrentUser(null);
        setCurrentCompany(null);
        setCompanies([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [bootstrapAppData]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.message || 'Login failed',
        };
      }

      const { accessToken, refreshToken, role, user, company } = data.data;

      const normalizedUser = normalizeUser({ ...user, role });
      const normalizedCompany = normalizeCompany(company);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));

      if (normalizedCompany) {
        localStorage.setItem('company', JSON.stringify(normalizedCompany));
      } else {
        localStorage.removeItem('company');
      }

      setCurrentUser(normalizedUser);
      setCurrentCompany(normalizedCompany || null);

      await bootstrapAppData();

      return {
        success: true,
        role,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error – cannot reach server',
      };
    }
  }, [bootstrapAppData]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('company');

    setCurrentUser(null);
    setCurrentCompany(null);
    setCompanies([]);
    setUsers([]);
  }, []);

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

  // Company CRUD - now backend based
  const addCompany = useCallback(async (company) => {
    try {
      const payload = {
        name: company.name,
        domain: company.domain || '',
        industry: company.industry || 'Technology',
        plan: company.plan || 'pro',
        adminName: company.adminName,
        adminEmail: company.adminEmail,
        adminPassword: company.adminPassword || 'admin123',
        enabledModules: company.enabledModules || [],
      };

      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create company');
      }

      await bootstrapAppData();

      return data?.data?.company ? normalizeCompany(data.data.company) : null;
    } catch (error) {
      console.error('Add company failed:', error);
      throw error;
    }
  }, [bootstrapAppData]);

  const updateCompany = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update company');
      }

      await fetchCompanies();
      return data?.data?.company ? normalizeCompany(data.data.company) : null;
    } catch (error) {
      console.error('Update company failed:', error);
      throw error;
    }
  }, [fetchCompanies]);

  const deleteCompany = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete company');
      }

      await bootstrapAppData();
      return true;
    } catch (error) {
      console.error('Delete company failed:', error);
      throw error;
    }
  }, [bootstrapAppData]);

  const toggleCompanyStatus = useCallback(async (id) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;

    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    await updateCompany(id, { status: nextStatus });
  }, [companies, updateCompany]);

  // User CRUD - backend based
  const addUser = useCallback(async (user) => {
    try {
      const payload = {
        fullName: user.fullName,
        email: user.email,
        password: user.password || 'admin123',
        phone: user.phone || '',
        role: user.role || 'user',
        companyId: user.companyId || currentCompany?.id || null,
        department: user.department || '',
        designation: user.designation || '',
        employeeId: user.employeeId || '',
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create user');
      }

      await fetchUsers();
      return data?.data?.user ? normalizeUser(data.data.user) : null;
    } catch (error) {
      console.error('Add user failed:', error);
      throw error;
    }
  }, [currentCompany, fetchUsers]);

  const updateUser = useCallback(async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update user');
      }

      await fetchUsers();
      return data?.data?.user ? normalizeUser(data.data.user) : null;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete user');
      }

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }, [fetchUsers]);

  const toggleUserStatus = useCallback(async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    await updateUser(id, { status: nextStatus });
  }, [users, updateUser]);

  // Temporary mock-backed modules
  const addLead = (lead) => {
    const newLead = {
      ...lead,
      id: `l${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: 'Today',
    };
    setLeads((prev) => [...prev, newLead]);
    return newLead;
  };

  const updateLead = (id, updates) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

  const deleteLead = (id) =>
    setLeads((prev) => prev.filter((l) => l.id !== id));

  const addDeal = (deal) => {
    const newDeal = {
      ...deal,
      id: `d${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDeals((prev) => [...prev, newDeal]);
    return newDeal;
  };

  const updateDeal = (id, updates) =>
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

  const deleteDeal = (id) =>
    setDeals((prev) => prev.filter((d) => d.id !== id));

  const addTask = (task) => {
    const newTask = { ...task, id: `t${Date.now()}` };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id, updates) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const addAutomation = (auto) => {
    const newAuto = { ...auto, id: `a${Date.now()}`, runs: 0 };
    setAutomations((prev) => [...prev, newAuto]);
  };

  const updateAutomation = (id, updates) =>
    setAutomations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

  const deleteAutomation = (id) =>
    setAutomations((prev) => prev.filter((a) => a.id !== id));

  const toggleAutomation = (id) =>
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: !a.status } : a))
    );

  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: `tk${Date.now()}`,
      created: new Date().toISOString().split('T')[0],
      status: 'open',
      companyId: currentCompany?.id,
      createdBy: currentUser?.id,
      createdByName: currentUser?.fullName,
      resolvedBy: null,
      resolvedAt: null,
      comment: '',
    };
    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicket = (id, updates) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

  const deleteTicket = (id) =>
    setTickets((prev) => prev.filter((t) => t.id !== id));

  const resolveTicket = (id, comment) =>
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            status: 'resolved',
            resolvedBy: currentUser?.id,
            resolvedByName: currentUser?.fullName,
            resolvedAt: new Date().toISOString().split('T')[0],
            comment,
          }
          : t
      )
    );

  const addLeave = (leave) => {
    const newLeave = {
      ...leave,
      id: `lv${Date.now()}`,
      appliedOn: new Date().toISOString().split('T')[0],
      status: 'pending',
      companyId: currentCompany?.id,
      userId: currentUser?.id,
    };
    setLeaves((prev) => [newLeave, ...prev]);
    return newLeave;
  };

  const updateLeave = (id, updates) =>
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

  const addAttendance = (record) => {
    const newRecord = {
      ...record,
      id: `at${Date.now()}`,
      userId: currentUser?.id,
      date: new Date().toISOString().split('T')[0],
    };
    setAttendance((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateAttendance = (id, updates) =>
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));

  const toggleCompanyModule = (moduleId) => {
    if (!currentCompany) return;
    const enabled = currentCompany.enabledModules || [];
    const updated = enabled.includes(moduleId)
      ? enabled.filter((m) => m !== moduleId)
      : [...enabled, moduleId];

    setCurrentCompany((prev) => ({
      ...prev,
      enabledModules: updated,
    }));
  };

  const updateRolePermission = (role, module, action, value) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...(prev[role]?.[module] || {}),
          [action]: value,
        },
      },
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentCompany,
        login,
        logout,
        hasPermission,
        isModuleEnabled,

        companies,
        addCompany,
        updateCompany,
        deleteCompany,
        toggleCompanyStatus,

        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,

        leads,
        addLead,
        updateLead,
        deleteLead,

        deals,
        addDeal,
        updateDeal,
        deleteDeal,

        tasks,
        addTask,
        updateTask,
        deleteTask,

        payments,
        setPayments,

        automations,
        addAutomation,
        updateAutomation,
        deleteAutomation,
        toggleAutomation,

        tickets,
        addTicket,
        updateTicket,
        deleteTicket,
        resolveTicket,

        leaves,
        addLeave,
        updateLeave,

        attendance,
        addAttendance,
        updateAttendance,

        rolePermissions,
        updateRolePermission,
        toggleCompanyModule,

        fetchCompanies,
        fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}