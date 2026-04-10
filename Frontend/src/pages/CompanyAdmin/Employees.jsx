import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { DEFAULT_ROLE_PERMISSIONS } from '../../data/mockData';
import {
  Plus, Search, Users, Edit2, Trash2, Power, Shield,
  Briefcase, Mail, Clock, ChevronDown,
} from 'lucide-react';

const ALL_ROLES = [
  { value: 'sales',            label: 'Sales Rep',        color: '#F59E0B' },
  { value: 'manager',         label: 'Manager',           color: '#0EA5E9' },
  { value: 'support',         label: 'Support Rep',       color: '#6366F1' },
  { value: 'finance',         label: 'Finance',           color: '#10B981' },
  { value: 'marketing',       label: 'Marketing',         color: '#EC4899' },
  { value: 'hr',              label: 'HR',                color: '#8B5CF6' },
  { value: 'operations',      label: 'Operations',        color: '#14B8A6' },
  { value: 'customer_success',label: 'Customer Success',  color: '#F97316' },
  { value: 'legal',           label: 'Legal',             color: '#64748B' },
];

const DEPARTMENTS = [
  'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations',
  'Customer Support', 'Customer Success', 'Legal & Compliance',
  'Engineering', 'Product', 'Management', 'Admissions', 'Other',
];

const ROLE_COLOR = ALL_ROLES.reduce((acc, r) => { acc[r.value] = r.color; return acc; }, {});

export default function CAEmployees() {
  const {
    currentCompany, users, addUser, updateUser, deleteUser,
    toggleUserStatus, rolePermissions, updateRolePermission, isModuleEnabled,
  } = useAuth();

  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdd, setShowAdd]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab]   = useState('employees');
  const [form, setForm] = useState({ name: '', email: '', password: 'user123', role: 'sales', department: 'Sales' });

  const companyUsers = users.filter(u => u.companyId === currentCompany?.id && u.role !== 'company_admin');
  const filtered = companyUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole   === 'all' || u.role   === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    addUser({ ...form, companyId: currentCompany.id });
    setShowAdd(false);
    setForm({ name: '', email: '', password: 'user123', role: 'sales', department: 'Sales' });
  };

  const handleEdit = () => {
    updateUser(editTarget.id, { name: form.name, email: form.email, role: form.role, department: form.department });
    setEditTarget(null);
  };

  const openEdit = (u) => { setEditTarget(u); setForm({ ...u }); };

  const modules = ['leads', 'deals', 'contacts', 'tasks', 'reports', 'payments', 'automation', 'tickets'].filter(m => isModuleEnabled(m));
  const actions = ['view', 'create', 'edit', 'delete'];

  const EmpForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Full Name" required>
          <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
        </FormGroup>
        <FormGroup label="Work Email" required>
          <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
        </FormGroup>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Role">
          <select className="select-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ALL_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Department">
          <select className="select-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FormGroup>
      </div>
      {!editTarget && (
        <FormGroup label="Temporary Password">
          <input className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="user123" />
        </FormGroup>
      )}
      {/* Role preview */}
      {form.role && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: `${ROLE_COLOR[form.role] || '#64748B'}08`, border: `1px solid ${ROLE_COLOR[form.role] || '#64748B'}20` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLOR[form.role] || '#64748B', marginBottom: 3 }}>
            {ALL_ROLES.find(r => r.value === form.role)?.label} — Role Preview
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Permissions for this role are pre-configured. Fine-tune them in the <strong>Permissions</strong> tab after adding.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="Team Management" subtitle={`${companyUsers.length} employees across ${new Set(companyUsers.map(u => u.department)).size} departments`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Employee
        </button>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, padding: 4, borderRadius: 12, width: 'fit-content', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        {[{ id: 'employees', label: 'Employees' }, { id: 'permissions', label: 'Role Permissions' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: activeTab === tab.id ? '1px solid var(--border-primary)' : '1px solid transparent' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'employees' && (
        <>
          {/* Role summary badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {ALL_ROLES.map(r => {
              const count = companyUsers.filter(u => u.role === r.value).length;
              if (count === 0) return null;
              return (
                <button key={r.value} onClick={() => setFilterRole(filterRole === r.value ? 'all' : r.value)}
                  style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                    background: filterRole === r.value ? `${r.color}25` : `${r.color}10`,
                    color: r.color, border: `1px solid ${filterRole === r.value ? r.color : r.color + '25'}` }}>
                  {count} {r.label}
                </button>
              );
            })}
            {filterRole !== 'all' && (
              <button onClick={() => setFilterRole('all')} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}>
                Clear ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select-field" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Users} title="No Employees Found" description="Add your first team member to get started."
              action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Employee</button>} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(u => {
                const roleConf = ALL_ROLES.find(r => r.value === u.role);
                const color = roleConf?.color || '#64748B';
                return (
                  <div key={u.id} className="card card-hover" style={{ padding: 16, position: 'relative' }}>
                    {/* Status indicator stripe */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '12px 12px 0 0',
                      background: u.status === 'active' ? color : '#EF4444' }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${color}, ${color}88)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                          {u.avatar}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{u.email}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={() => toggleUserStatus(u.id)} title={u.status === 'active' ? 'Suspend' : 'Activate'}
                          style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: u.status === 'active' ? '#10B981' : '#EF4444' }}>
                          <Power size={13} />
                        </button>
                        <button onClick={() => openEdit(u)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(u)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 20, textTransform: 'capitalize',
                        background: `${color}15`, color }}>
                        {roleConf?.label || u.role}
                      </span>
                      <Badge value={u.status} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Briefcase size={11} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.department || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.lastLogin || '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'permissions' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={15} style={{ color: '#0EA5E9' }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Role-Based Access Control</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Toggle cell permissions for each role. Changes apply immediately.</p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {ALL_ROLES.filter(r => rolePermissions[r.value]).map(roleConf => (
              <div key={roleConf.value} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div style={{ padding: '10px 20px', background: `${roleConf.color}08`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: roleConf.color }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: roleConf.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {roleConf.label}
                  </span>
                </div>
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 20px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', width: 160 }}>Module</th>
                      {actions.map(a => <th key={a} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center' }}>{a}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(mod => (
                      <tr key={mod} style={{ borderTop: '1px solid rgba(30,45,69,0.4)' }}>
                        <td style={{ padding: '8px 20px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{mod}</td>
                        {actions.map(action => {
                          const enabled = rolePermissions[roleConf.value]?.[mod]?.[action] ?? false;
                          return (
                            <td key={action} style={{ padding: '8px 12px', textAlign: 'center' }}>
                              <label className="toggle-switch" style={{ width: 36, height: 20 }}>
                                <input type="checkbox" checked={enabled} onChange={() => updateRolePermission(roleConf.value, mod, action, !enabled)} />
                                <span className="toggle-slider" />
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Team Member">
        <EmpForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Employee</button>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Employee">
        <EmpForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteUser(deleteTarget?.id)}
        title="Remove Employee" message={`Remove "${deleteTarget?.name}" from the team? This action cannot be undone.`}
      />
    </div>
  );
}
