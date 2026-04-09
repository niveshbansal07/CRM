import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { Plus, Search, TrendingUp, Edit2, Trash2, Phone, Mail, Filter } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'lost'];
const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Event', 'Ad', 'Instagram', 'Other'];
const PRIORITIES = ['high', 'medium', 'low'];

export default function CALeads() {
  const { currentCompany, leads, users, addLead, updateLead, deleteLead } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // table | kanban

  const defaultForm = { name: '', contact: '', email: '', phone: '', status: 'new', source: 'Website', value: '', priority: 'medium', assignedTo: '', tags: [] };
  const [form, setForm] = useState(defaultForm);

  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id && ['sales', 'manager'].includes(u.role));

  const filtered = companyLeads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchPriority = filterPriority === 'all' || l.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unassigned';

  const handleAdd = () => {
    if (!form.name) return;
    addLead({ ...form, companyId: currentCompany.id, value: Number(form.value) || 0 });
    setShowAdd(false);
    setForm(defaultForm);
  };

  const handleEdit = () => {
    updateLead(editTarget.id, { ...form, value: Number(form.value) });
    setEditTarget(null);
  };

  const openEdit = (l) => { setEditTarget(l); setForm({ ...l }); };

  const LeadForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Company / Lead Name" required>
          <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Acme Corp" />
        </FormGroup>
        <FormGroup label="Contact Person">
          <input className="input-field" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="John Doe" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Email">
          <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@acme.com" />
        </FormGroup>
        <FormGroup label="Phone">
          <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormGroup label="Status">
          <select className="select-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Priority">
          <select className="select-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Source">
          <select className="select-field" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Lead Value (₹)">
          <input className="input-field" type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="50000" />
        </FormGroup>
        <FormGroup label="Assign To">
          <select className="select-field" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
            <option value="">Unassigned</option>
            {companyUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </FormGroup>
      </div>
    </div>
  );

  // Kanban view
  const KanbanBoard = () => (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUSES.map(status => {
        const statusLeads = filtered.filter(l => l.status === status);
        const statusColors = { new: '#0EA5E9', contacted: '#6366F1', qualified: '#F59E0B', proposal: '#A855F7', lost: '#EF4444' };
        const color = statusColors[status] || '#64748B';
        return (
          <div key={status} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
              style={{ background: `${color}15`, border: `1px solid ${color}25`, borderBottom: 'none' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color }}></div>
                <span className="text-xs font-700 uppercase tracking-wider" style={{ color }}>
                  {status}
                </span>
              </div>
              <span className="text-xs font-700 px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
                {statusLeads.length}
              </span>
            </div>
            <div className="p-2 rounded-b-xl min-h-24" style={{ background: 'var(--bg-secondary)', border: `1px solid ${color}20`, borderTop: 'none' }}>
              <div className="flex flex-col gap-2">
                {statusLeads.map(l => (
                  <div key={l.id} className="pipeline-card">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{l.name}</p>
                      <button onClick={() => openEdit(l)} className="p-1" style={{ color: 'var(--text-muted)' }}>
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{l.contact}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-600" style={{ color: '#10B981' }}>₹{l.value?.toLocaleString()}</span>
                      <Badge value={l.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="Leads" subtitle={`${companyLeads.length} total leads`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Lead</button>
      </PageHeader>

      {/* Summary */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {STATUSES.map(s => {
          const count = companyLeads.filter(l => l.status === s).length;
          const colors = { new: '#0EA5E9', contacted: '#6366F1', qualified: '#F59E0B', proposal: '#A855F7', lost: '#EF4444' };
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className="px-3 py-1.5 rounded-full text-xs font-700 transition-all"
              style={{
                background: filterStatus === s ? `${colors[s]}20` : `${colors[s]}0A`,
                color: colors[s],
                border: `1px solid ${filterStatus === s ? colors[s] + '50' : colors[s] + '20'}`,
              }}>
              {count} {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 130 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
        </select>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {['table', 'kanban'].map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className="px-3 py-1.5 rounded-md text-xs font-600 capitalize transition-all"
              style={{
                background: viewMode === m ? 'var(--bg-card)' : 'transparent',
                color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        filtered.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No Leads" description="Add your first lead to get started." />
        ) : <KanbanBoard />
      ) : (
        filtered.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No Leads Found" description="Try adjusting your filters." />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Lead</th><th>Contact</th><th>Status</th><th>Value</th><th>Priority</th><th>Source</th><th>Assigned To</th><th>Last Contact</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td>
                        <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{l.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.email}</p>
                      </td>
                      <td style={{ fontSize: 12 }}>{l.contact}</td>
                      <td><Badge value={l.status} /></td>
                      <td><span className="font-mono text-xs font-600" style={{ color: '#10B981' }}>₹{l.value?.toLocaleString()}</span></td>
                      <td><Badge value={l.priority} /></td>
                      <td style={{ fontSize: 12 }}>{l.source}</td>
                      <td style={{ fontSize: 12 }}>{getUserName(l.assignedTo)}</td>
                      <td style={{ fontSize: 12 }}>{l.lastContact}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <a href={`tel:${l.phone}`} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} title="Call">
                            <Phone size={13} />
                          </a>
                          <a href={`mailto:${l.email}`} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} title="Email">
                            <Mail size={13} />
                          </a>
                          <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(l)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Lead" width={580}>
        <LeadForm />
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Add Lead</button></div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Lead" width={580}>
        <LeadForm />
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button><button className="btn-primary" onClick={handleEdit}>Save</button></div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteLead(deleteTarget?.id)} title="Delete Lead" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
