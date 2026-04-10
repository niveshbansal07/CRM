import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, ConfirmDialog, EmptyState } from '../../components/common';
import { Search, Users, Power, Trash2, Download, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ROLE_COLORS = {
  company_admin: '#A855F7',
  manager:       '#0EA5E9',
  sales:         '#F59E0B',
  support:       '#6366F1',
  finance:       '#10B981',
};

const LAST_LOGIN_COLOR = (login) => {
  if (!login || login === 'Never') return '#EF4444';
  if (login.includes('min') || login.includes('hour') || login === 'Today') return '#10B981';
  if (login.includes('day') || login === 'Yesterday') return '#F59E0B';
  return '#64748B';
};

export default function SAUsers() {
  const { users, companies, toggleUserStatus, deleteUser } = useAuth();
  const [search, setSearch]         = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterRole, setFilterRole]       = useState('all');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [deleteTarget, setDeleteTarget]   = useState(null);

  const getCompanyName = (cId) => companies.find(c => c.id === cId)?.name || '—';
  const getCompanyPlan = (cId) => companies.find(c => c.id === cId)?.plan || 'free';

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchCompany = filterCompany === 'all' || u.companyId === filterCompany;
    const matchRole    = filterRole    === 'all' || u.role === filterRole;
    const matchStatus  = filterStatus  === 'all' || u.status === filterStatus;
    return matchSearch && matchCompany && matchRole && matchStatus;
  });

  // Role distribution for donut
  const roleData = Object.entries(
    users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {})
  ).map(([role, count]) => ({ name: role, value: count, color: ROLE_COLORS[role] || '#64748B' }));

  return (
    <div className="page-enter">
      <PageHeader title="Global Users" subtitle={`${filtered.length} users across all ${companies.length} companies`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20,
          background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
          <Users size={13} style={{ color: '#0EA5E9' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0EA5E9' }}>{users.length} Total Users</span>
        </div>
      </PageHeader>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active Users',    count: users.filter(u => u.status === 'active').length,    color: '#10B981' },
          { label: 'Suspended',       count: users.filter(u => u.status === 'suspended').length,  color: '#EF4444' },
          { label: 'Admins',          count: users.filter(u => u.role === 'company_admin').length, color: '#A855F7' },
          { label: 'Sales Reps',      count: users.filter(u => u.role === 'sales').length,         color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.count}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}

        {/* Role Donut */}
        <div className="card p-4" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ResponsiveContainer width={80} height={80}>
            <PieChart>
              <Pie data={roleData} cx="50%" cy="50%" innerRadius={22} outerRadius={38} paddingAngle={3} dataKey="value">
                {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {roleData.map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: 2, background: r.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {r.name.replace('_', ' ')} ({r.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 170 }} value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
          <option value="all">All Companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="select-field" style={{ width: 140 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {['company_admin','manager','sales','support','finance'].map(r => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
        <select className="select-field" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No Users Found" description="No users match your search criteria." />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th><th>Company</th><th>Plan</th><th>Role</th>
                  <th>Department</th><th>Status</th><th>Last Login</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const loginColor = LAST_LOGIN_COLOR(u.lastLogin);
                  const roleColor  = ROLE_COLORS[u.role] || '#64748B';
                  const plan       = getCompanyPlan(u.companyId);
                  const planColors = { enterprise: '#A855F7', pro: '#0EA5E9', free: '#64748B' };

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700, color: 'white' }}>
                            {u.avatar}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{u.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600,
                          background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>
                          {getCompanyName(u.companyId)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase',
                          background: `${planColors[plan]}18`, color: planColors[plan] }}>
                          {plan}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {u.role === 'company_admin' && <Shield size={11} style={{ color: '#A855F7' }} />}
                          <span style={{ fontSize: 11, fontWeight: 700, color: roleColor, textTransform: 'capitalize' }}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.department || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%',
                            background: u.status === 'active' ? '#10B981' : '#EF4444' }} />
                          <Badge value={u.status} />
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, color: loginColor }}>
                          {u.lastLogin || '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button title={u.status === 'active' ? 'Suspend user' : 'Activate user'}
                            onClick={() => toggleUserStatus(u.id)}
                            style={{ padding: 6, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer',
                              color: u.status === 'active' ? '#10B981' : '#EF4444', transition: 'all 0.15s' }}>
                            <Power size={14} />
                          </button>
                          <button title="Delete user" onClick={() => setDeleteTarget(u)}
                            style={{ padding: 6, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {filtered.length} of {users.length} users</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Active: <span style={{ color: '#10B981', fontWeight: 700 }}>{users.filter(u => u.status === 'active').length}</span>
              &nbsp;·&nbsp;Suspended: <span style={{ color: '#EF4444', fontWeight: 700 }}>{users.filter(u => u.status === 'suspended').length}</span>
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteUser(deleteTarget?.id)}
        title="Delete User"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
