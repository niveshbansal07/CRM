import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, Users, CreditCard, BarChart2,
  Zap, Settings, Package, ChevronLeft, ChevronRight,
  LogOut, TrendingUp, CheckSquare, Contact, Ticket,
  Shield, Layers, Calendar, Activity, UserCircle, UserCog
} from 'lucide-react';

const SUPER_ADMIN_NAV = [
  { path: '/admin/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/admin/companies',    label: 'Companies',     icon: Building2 },
  { path: '/admin/users',        label: 'All Users',     icon: Users },
  { path: '/admin/plans',        label: 'Plans',         icon: Package },
  { path: '/admin/analytics',    label: 'Analytics',     icon: BarChart2 },
  { path: '/admin/activity-log', label: 'Activity Log',  icon: Activity },
];

const COMPANY_ADMIN_NAV = [
  { path: '/company/dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/company/human-resources', label: 'Human Resources', icon: UserCog },
  { path: '/company/employees',  label: 'Employees',      icon: Users },
  { path: '/company/leads',      label: 'Leads',          icon: TrendingUp,  module: 'leads' },
  { path: '/company/deals',      label: 'Deals',          icon: Layers,      module: 'deals' },
  { path: '/company/contacts',   label: 'Contacts',       icon: Contact,     module: 'contacts' },
  { path: '/company/calendar',   label: 'Calendar',       icon: Calendar,    module: 'tasks' },
  { path: '/company/payments',   label: 'Payments',       icon: CreditCard,  module: 'payments' },
  { path: '/company/automation', label: 'Automation',     icon: Zap,         module: 'automation' },
  { path: '/company/reports',    label: 'Reports',        icon: BarChart2,   module: 'reports' },
  { path: '/company/modules',    label: 'Module Control', icon: Shield },
  { path: '/company/settings',   label: 'Settings',       icon: Settings },
];

const USER_NAV_BASE = [
  { path: '/user/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { path: '/user/profile',   label: 'My Profile', icon: UserCircle },
  { path: '/user/leads',     label: 'My Leads',   icon: TrendingUp,  module: 'leads',    roles: ['sales','manager'] },
  { path: '/user/deals',     label: 'My Deals',   icon: Layers,      module: 'deals',    roles: ['sales','manager','finance'] },
  { path: '/user/tasks',     label: 'My Tasks',   icon: CheckSquare, module: 'tasks' },
  { path: '/user/contacts',  label: 'Contacts',   icon: Contact,     module: 'contacts', roles: ['sales','manager','support'] },
  { path: '/user/tickets',   label: 'Tickets',    icon: Ticket,      module: 'tickets',  roles: ['support','manager'] },
];

/* ─── Role color config ─── */
const ROLE_COLORS = {
  super_admin:   '#A855F7',
  company_admin: '#0EA5E9',
  manager:       '#0EA5E9',
  sales:         '#F59E0B',
  support:       '#6366F1',
  finance:       '#10B981',
};

export default function Sidebar({ role, open, setOpen }) {
  const { currentUser, currentCompany, logout, isModuleEnabled } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  let navItems = [];
  if (role === 'super_admin')   navItems = SUPER_ADMIN_NAV;
  else if (role === 'company_admin') navItems = COMPANY_ADMIN_NAV;
  else navItems = USER_NAV_BASE;

  const filteredNav = navItems.filter(item => {
    if (item.module && role !== 'super_admin') {
      if (!isModuleEnabled(item.module)) return false;
    }
    if (item.roles && currentUser) {
      if (!item.roles.includes(currentUser.role)) return false;
    }
    return true;
  });

  const accentColor = ROLE_COLORS[currentUser?.role] || '#0EA5E9';

  const roleLabel = role === 'super_admin' ? 'Super Admin'
    : role === 'company_admin' ? 'Company Admin'
    : currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : 'User';

  /* ─── Nav group headers ─── */
  const USER_GROUPS = [
    { header: 'WORKSPACE', items: filteredNav.filter(i => ['Dashboard','My Profile'].includes(i.label)) },
    { header: 'MY WORK',   items: filteredNav.filter(i => ['My Leads','My Deals','My Tasks','Contacts','Tickets'].includes(i.label)) },
  ];

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-300"
      style={{
        width: open ? '240px' : '64px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--border-primary)', minHeight: 64 }}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
          <span className="font-display font-700 text-white text-sm tracking-widest">TF</span>
        </div>
        {open && (
          <div>
            <div className="font-display font-700 tracking-widest text-base" style={{ color: 'var(--text-primary)', letterSpacing: '0.12em' }}>
              TRACKFIELD
            </div>
            <div className="text-xs font-700" style={{ color: accentColor, marginTop: 1, letterSpacing: '0.04em' }}>
              {roleLabel}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {/* User role: grouped nav */}
        {role === 'user' ? (
          <>
            {USER_GROUPS.map(group => {
              const visibleItems = group.items;
              if (visibleItems.length === 0) return null;
              return (
                <div key={group.header} className="mb-4">
                  {open && (
                    <p className="px-3 mb-1.5 text-xs font-700 tracking-widest uppercase" style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                      {group.header}
                    </p>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <NavLink key={item.path} to={item.path}
                          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                          title={!open ? item.label : ''}>
                          <Icon size={16} className="flex-shrink-0" />
                          {open && <span>{item.label}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {open && <p className="px-3 mb-2 text-xs font-700 tracking-widest uppercase" style={{ color: 'var(--text-muted)', fontSize: 10 }}>Navigation</p>}
            <div className="flex flex-col gap-0.5">
              {filteredNav.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path}
                    className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                    title={!open ? item.label : ''}>
                    <Icon size={16} className="flex-shrink-0" />
                    {open && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </>
        )}

        {/* Company info pill */}
        {open && role === 'company_admin' && currentCompany && (
          <div className="mt-4 mx-1 rounded-xl p-3" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
            <p className="text-xs font-700 mb-0.5" style={{ color: '#0EA5E9' }}>Company</p>
            <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{currentCompany.name}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentCompany.plan} plan</p>
          </div>
        )}

        {/* User — company badge */}
        {open && role === 'user' && currentCompany && (
          <div className="mt-4 mx-1 rounded-xl p-3" style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}18` }}>
            <p className="text-xs font-700 mb-0.5" style={{ color: accentColor }}>Your Company</p>
            <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{currentCompany.name}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>{currentUser?.department}</p>
          </div>
        )}
      </nav>

      {/* Bottom: user + logout */}
      <div style={{ borderTop: '1px solid var(--border-primary)' }}>
        {currentUser && (
          <div className="flex items-center gap-2.5 p-3">
            {/* Avatar — clickable to profile for users */}
            <button
              onClick={() => role === 'user' ? navigate('/user/profile') : null}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-700 transition-transform"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`, color: 'white' }}
              title={role === 'user' ? 'View my profile' : currentUser.name}
              onMouseEnter={e => { if (role === 'user') e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {currentUser.avatar || currentUser.name?.[0]}
            </button>

            {open && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-700 truncate" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</p>
                  <p style={{ fontSize: 10, color: accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{roleLabel}</p>
                </div>
                <button onClick={handleLogout} className="p-1.5 rounded-lg transition-colors flex-shrink-0" title="Sign out"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center py-2 text-xs transition-colors"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-primary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          {open
            ? <><ChevronLeft size={14} /><span className="ml-1 text-xs">Collapse</span></>
            : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
}