// ─── USER: MY LEADS ──────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { TrendingUp, Phone, Mail, Plus, Edit2, Trash2, Search } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'lost'];
const SOURCES = ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Event', 'Ad', 'Other'];

export default function UMyLeads() {
  const { currentUser, currentCompany, leads, addLead, updateLead, deleteLead, hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '', status: 'new', source: 'Website', value: '', priority: 'medium' });

  const myLeads = leads.filter(l => l.assignedTo === currentUser?.id || l.companyId === currentCompany?.id).filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.name) return;
    addLead({ ...form, companyId: currentCompany.id, assignedTo: currentUser.id, value: Number(form.value) || 0 });
    setShowAdd(false);
    setForm({ name: '', contact: '', email: '', phone: '', status: 'new', source: 'Website', value: '', priority: 'medium' });
  };

  const handleEdit = () => {
    updateLead(editTarget.id, { ...form, value: Number(form.value) });
    setEditTarget(null);
  };

  const LeadForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Company Name" required><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Acme Corp" /></FormGroup>
        <FormGroup label="Contact"><input className="input-field" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Contact Person" /></FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Email"><input className="input-field" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormGroup>
        <FormGroup label="Phone"><input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91..." /></FormGroup>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormGroup label="Status"><select className="select-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></FormGroup>
        <FormGroup label="Priority"><select className="select-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></FormGroup>
        <FormGroup label="Value (₹)"><input className="input-field" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></FormGroup>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="My Leads" subtitle={`${myLeads.length} leads`}>
        {hasPermission('leads', 'create') && <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Lead</button>}
      </PageHeader>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {myLeads.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No Leads" description="Your leads will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {myLeads.map(l => (
            <div key={l.id} className="card card-hover p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-700 text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{l.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.contact}</p>
                </div>
                <Badge value={l.status} />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-700" style={{ color: '#10B981' }}>₹{l.value?.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <Badge value={l.priority} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <a href={`tel:${l.phone}`} className="btn-secondary flex-1 justify-center" style={{ padding: '6px', fontSize: 12 }}><Phone size={13} /> Call</a>
                <a href={`mailto:${l.email}`} className="btn-secondary flex-1 justify-center" style={{ padding: '6px', fontSize: 12 }}><Mail size={13} /> Email</a>
                {hasPermission('leads', 'edit') && <button onClick={() => { setEditTarget(l); setForm({ ...l }); }} className="p-1.5" style={{ color: 'var(--text-muted)' }}><Edit2 size={14} /></button>}
                {hasPermission('leads', 'delete') && <button onClick={() => setDeleteTarget(l)} className="p-1.5" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Lead" width={520}><LeadForm /><div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Add Lead</button></div></Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Lead" width={520}><LeadForm /><div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button><button className="btn-primary" onClick={handleEdit}>Save</button></div></Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteLead(deleteTarget?.id)} title="Delete Lead" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
