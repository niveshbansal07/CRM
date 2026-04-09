import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, ConfirmDialog, EmptyState } from '../../components/common';
import { Search, Users, Power, Trash2, Filter } from 'lucide-react';

export default function SAUsers() {
  const { users, companies, toggleUserStatus, deleteUser } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getCompanyName = (companyId) => companies.find(c => c.id === companyId)?.name || 'Unknown';

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchCompany = filterCompany === 'all' || u.companyId === filterCompany;
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchCompany && matchRole && matchStatus;
  });

  const roles = ['all', ...new Set(users.map(u => u.role))];

  return (
    <div className="page-enter">
      <PageHeader title="Global Users" subtitle={`${filtered.length} users across all companies`}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-700"
          style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
          <Users size={13} /> {users.length} Total
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 160 }} value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
          <option value="all">All Companies</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="select-field" style={{ width: 130 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {['company_admin','sales','manager','support','finance'].map(r => (
            <option key={r} value={r}>{r.replace('_',' ')}</option>
          ))}
        </select>
        <select className="select-field" style={{ width: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 mb-5">
        {[
          { label: 'Active', count: users.filter(u => u.status === 'active').length, color: '#10B981' },
          { label: 'Suspended', count: users.filter(u => u.status === 'suspended').length, color: '#EF4444' },
          { label: 'Admins', count: users.filter(u => u.role === 'company_admin').length, color: '#A855F7' },
          { label: 'Sales', count: users.filter(u => u.role === 'sales').length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-600"
            style={{ background: `${s.color}10`, border: `1px solid ${s.color}20`, color: s.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }}></span>
            {s.count} {s.label}
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No Users Found" description="No users match your search criteria." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', color: 'white' }}>
                          {u.avatar}
                        </div>
                        <div>
                          <p className="font-600" style={{ color: 'var(--text-primary)', fontSize: 13 }}>{u.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs px-2 py-1 rounded-lg font-600"
                        style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9' }}>
                        {getCompanyName(u.companyId)}
                      </span>
                    </td>
                    <td><Badge value={u.role === 'company_admin' ? 'company_admin' : u.role} /></td>
                    <td style={{ fontSize: 12 }}>{u.department || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === 'active' ? '#10B981' : '#EF4444' }}></div>
                        <Badge value={u.status} />
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{u.lastLogin || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          title={u.status === 'active' ? 'Suspend' : 'Activate'}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: u.status === 'active' ? '#10B981' : '#64748B' }}>
                          <Power size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
