import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { DEFAULT_ROLE_PERMISSIONS } from '../../data/mockData';
import { Plus, Search, Users, Edit2, Trash2, Power, Shield } from 'lucide-react';

const ROLES = ['sales', 'manager', 'support', 'finance'];
const DEPARTMENTS = ['Sales', 'Management', 'Support', 'Finance', 'Marketing', 'Operations', 'Admissions'];

export default function CAEmployees() {
  const { currentCompany, users, addUser, updateUser, deleteUser, toggleUserStatus, rolePermissions, updateRolePermission, isModuleEnabled } = useAuth();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');  // employees | permissions
  const [form, setForm] = useState({ });

  const companyUsers = users.filter(u => u.companyId === currentCompany?.id && u.role !== 'company_admin');
  const filtered = companyUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Full Name" required>
          <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
        </FormGroup>
        <FormGroup label="Email" required>
          <input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Role">
          <select className="select-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Department">
          <select className="select-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FormGroup>
      </div>
      {!editTarget && (
        <FormGroup label="Password">
          <input className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="user123" />
        </FormGroup>
      )}
      <div className="rounded-xl p-3" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
        <p className="text-xs" style={{ color: '#0EA5E9' }}>
          ℹ️ Permissions for the selected role are pre-configured. You can fine-tune them in the <strong>Permissions</strong> tab.
        </p>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="Employees" subtitle={`${companyUsers.length} team members`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Employee
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        {[
          { id: 'employees', label: 'Employees' },
          { id: 'permissions', label: 'Role Permissions' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-600 transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: activeTab === tab.id ? '1px solid var(--border-primary)' : '1px solid transparent',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'employees' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="input-wrapper">
              <Search size={16}
                className="Search-icon"
              />
              <input className="input-field" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Role summary */}
          <div className="flex gap-3 mb-5 flex-wrap">
            {ROLES.map(r => {
              const count = companyUsers.filter(u => u.role === r).length;
              const colors = { sales: '#F59E0B', manager: '#0EA5E9', support: '#6366F1', finance: '#10B981' };
              return (
                <div key={r} className="px-3 py-1.5 rounded-full text-xs font-600"
                  style={{ background: `${colors[r]}12`, color: colors[r], border: `1px solid ${colors[r]}25` }}>
                  {count} {r.charAt(0).toUpperCase() + r.slice(1)}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Users} title="No Employees" description="Add your first team member to get started."
              action={<button className="btn-primary"
                onClick={() => setShowAdd(true)}>
                <Plus size={14} /> Add Employee</button>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(u => (
                <div key={u.id} className="card card-hover p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', color: 'white' }}>
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-700 text-sm" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleUserStatus(u.id)} title={u.status === 'active' ? 'Suspend' : 'Activate'}
                        className="p-1.5 rounded-lg" style={{ color: u.status === 'active' ? '#10B981' : '#EF4444' }}>
                        <Power size={14} />
                      </button>
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge value={u.role} />
                      <Badge value={u.status} />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.department}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Last: {u.lastLogin}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'permissions' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: '#0EA5E9' }} />
              <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Role-Based Permissions</p>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Control what each role can do. Toggle cells to grant or revoke access.
            </p>
          </div>
          <div className="overflow-x-auto">
            {ROLES.map(role => (
              <div key={role} className="mb-0" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="px-5 py-3" style={{ background: 'var(--bg-secondary)' }}>
                  <Badge value={role} />
                </div>
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th className="text-left px-5 py-2 text-xs font-700 uppercase tracking-widest" style={{ color: 'var(--text-muted)', width: 140 }}>Module</th>
                      {actions.map(a => (
                        <th key={a} className="px-3 py-2 text-xs font-700 uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>{a}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(mod => (
                      <tr key={mod} style={{ borderTop: '1px solid rgba(30,45,69,0.4)' }}>
                        <td className="px-5 py-2.5 text-xs font-600 capitalize" style={{ color: 'var(--text-secondary)' }}>{mod}</td>
                        {actions.map(action => {
                          const enabled = rolePermissions[role]?.[mod]?.[action] ?? false;
                          return (
                            <td key={action} className="px-3 py-2.5 text-center">
                              <label className="toggle-switch" style={{ width: 36, height: 20 }}>
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() => updateRolePermission(role, mod, action, !enabled)}
                                />
                                <span className="toggle-slider"></span>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Employee">
        <EmpForm />
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Employee</button>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Employee">
        <EmpForm />
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteUser(deleteTarget?.id)}
        title="Remove Employee"
        message={`Remove "${deleteTarget?.name}" from the team?`}
      />
    </div>
  );
}
