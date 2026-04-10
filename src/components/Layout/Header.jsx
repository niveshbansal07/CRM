import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, ChevronDown, TrendingUp, CheckSquare, Building2, Zap, X, Layers, Users, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'lead', icon: TrendingUp, color: '#0EA5E9', title: 'New lead assigned', body: 'TechCorp Pvt Ltd was assigned to you', time: '2m ago', read: false },
  { id: 'n2', type: 'deal', icon: Zap, color: '#10B981', title: 'Deal moved to Negotiation', body: 'StartupNest Platform Deal advanced', time: '15m ago', read: false },
  { id: 'n3', type: 'task', icon: CheckSquare, color: '#F59E0B', title: 'Task overdue', body: 'Follow up with TechCorp is overdue', time: '1h ago', read: false },
  { id: 'n4', type: 'company', icon: Building2, color: '#A855F7', title: 'New company joined', body: 'EduPath Academy is now on the platform', time: '3h ago', read: true },
  { id: 'n5', type: 'deal', icon: Zap, color: '#10B981', title: 'Deal closed won! 🎉', body: 'MedPlus Annual Contract — ₹4,80,000', time: 'Yesterday', read: true },
];

export default function Header({ role, onMenuToggle }) {
  const { currentUser, currentCompany, logout, leads, deals, users } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('tf-theme');
    return saved ? saved === 'dark' : true;
  });
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const searchRef = useRef(null);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('tf-theme', isDark ? 'dark' : 'light');
  }, [isDark]);


  const unreadCount = notifs.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setShowSearch(false); setSearchQuery(''); }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Global search across leads, deals, users
  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setShowSearch(false); return; }
    const low = q.toLowerCase();
    const companyId = currentCompany?.id;
    const results = [];
    // Leads / Contacts
    leads?.filter(l => l.companyId === companyId && (
      l.name?.toLowerCase().includes(low) || l.contact?.toLowerCase().includes(low) || l.email?.toLowerCase().includes(low)
    )).slice(0, 3).forEach(l => results.push({ type: 'Lead', label: l.name, sub: l.contact, color: '#0EA5E9', icon: TrendingUp, path: role === 'company_admin' ? '/company/leads' : '/user/leads' }));
    // Deals
    deals?.filter(d => d.companyId === companyId && d.name?.toLowerCase().includes(low))
      .slice(0, 2).forEach(d => results.push({ type: 'Deal', label: d.name, sub: `₹${(d.value || 0).toLocaleString()}`, color: '#10B981', icon: Layers, path: role === 'company_admin' ? '/company/deals' : '/user/deals' }));
    // Users
    users?.filter(u => u.companyId === companyId && (
      u.name?.toLowerCase().includes(low) || u.email?.toLowerCase().includes(low)
    )).slice(0, 2).forEach(u => results.push({ type: 'User', label: u.name, sub: u.role, color: '#A855F7', icon: Users, path: '/company/employees' }));
    setSearchResults(results);
    setShowSearch(results.length > 0);
  }, [leads, deals, users, currentCompany, role]);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const dismissNotif = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColors = {
    super_admin: { bg: 'rgba(168,85,247,0.12)', text: '#A855F7', label: 'Super Admin' },
    company_admin: { bg: 'rgba(14,165,233,0.12)', text: '#0EA5E9', label: 'Company Admin' },
    manager: { bg: 'rgba(14,165,233,0.12)', text: '#0EA5E9', label: 'Manager' },
    sales: { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', label: 'Sales Rep' },
    support: { bg: 'rgba(99,102,241,0.12)', text: '#6366F1', label: 'Support' },
    finance: { bg: 'rgba(16,185,129,0.12)', text: '#10B981', label: 'Finance' },
    marketing: { bg: 'rgba(236,72,153,0.12)', text: '#EC4899', label: 'Marketing' },
    hr: { bg: 'rgba(139,92,246,0.12)', text: '#8B5CF6', label: 'HR' },
    operations: { bg: 'rgba(20,184,166,0.12)', text: '#14B8A6', label: 'Operations' },
    customer_success: { bg: 'rgba(249,115,22,0.12)', text: '#F97316', label: 'Customer Success' },
    legal: { bg: 'rgba(100,116,139,0.12)', text: '#64748B', label: 'Legal' },
  };
  const roleStyle = roleColors[currentUser?.role] || roleColors.sales;

  return (
    <header className="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)', height: 64 }}>

      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <Menu size={18} />
        </button>
        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search anything..."
            className="input-field pl-9"
            style={{ width: 280, height: 36, fontSize: 13 }}
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowSearch(searchResults.length > 0)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearch(false); }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={12} />
            </button>
          )}
          {/* Results dropdown */}
          {showSearch && (
            <div className="absolute left-0 top-full mt-2 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', width: 340 }}>
              <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              </div>
              {searchResults.map((r, i) => {
                const Icon = r.icon;
                return (
                  <button key={i} onClick={() => { navigate(r.path); setShowSearch(false); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={12} style={{ color: r.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.sub}</p>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${r.color}12`, color: r.color }}>{r.type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-700"
          style={{ background: roleStyle.bg, color: roleStyle.text }}>
          {roleStyle.label}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          className="p-2 rounded-lg transition-colors"
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          style={{ color: 'var(--text-muted)', background: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: showNotifs ? 'var(--bg-hover)' : 'transparent' }}>
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-800"
                style={{ background: '#EF4444', fontSize: 9 }}>{unreadCount}</span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 rounded-2xl shadow-2xl overflow-hidden z-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', width: 340 }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-700" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-600" style={{ color: '#0EA5E9' }}>Mark all read</button>
                )}
              </div>

              {/* Notif list */}
              <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
                {notifs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All caught up! 🎉</p>
                  </div>
                ) : notifs.map(n => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id}
                      className="flex items-start gap-3 px-4 py-3 transition-colors relative"
                      style={{ background: n.read ? 'transparent' : 'rgba(14,165,233,0.04)', borderBottom: '1px solid rgba(30,45,69,0.5)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(14,165,233,0.04)'}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${n.color}18` }}>
                        <Icon size={14} style={{ color: n.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-700" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                        <p className="text-xs mt-0.5 font-600" style={{ color: n.color }}>{n.time}</p>
                      </div>
                      <div className="flex items-start gap-1 flex-shrink-0">
                        {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: '#0EA5E9' }}></div>}
                        <button onClick={() => dismissNotif(n.id)} className="p-0.5 rounded transition-colors"
                          style={{ color: 'var(--text-muted)' }}>
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <button className="w-full text-xs font-600 text-center py-1" style={{ color: '#0EA5E9' }}>
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)', background: showUserMenu ? 'var(--bg-hover)' : 'transparent' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', color: 'white' }}>
              {currentUser?.avatar || currentUser?.name?.[0]}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-600" style={{ color: 'var(--text-primary)', lineHeight: 1.2 }}>{currentUser?.name}</p>
              {currentCompany && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentCompany.name}</p>}
            </div>
            <ChevronDown size={14} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 rounded-xl shadow-2xl overflow-hidden z-50"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', width: 200 }}>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</p>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-700"
                  style={{ background: roleStyle.bg, color: roleStyle.text }}>
                  {roleStyle.label}
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                style={{ color: '#EF4444' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}