// ─── USER: MY LEADS ──────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { TrendingUp, Phone, Mail, Plus, Edit2, Trash2, Search } from 'lucide-react';

const STATUSES = ['new','contacted','qualified','proposal','lost'];
const SOURCES = ['Website','LinkedIn','Referral','Cold Call','Event','Ad','Other'];

export function UMyLeads() {
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
        <FormGroup label="Company Name" required><input className="input-field" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Acme Corp" /></FormGroup>
        <FormGroup label="Contact"><input className="input-field" value={form.contact} onChange={e => setForm({...form,contact:e.target.value})} placeholder="Contact Person" /></FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Email"><input className="input-field" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} /></FormGroup>
        <FormGroup label="Phone"><input className="input-field" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="+91..." /></FormGroup>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormGroup label="Status"><select className="select-field" value={form.status} onChange={e => setForm({...form,status:e.target.value})}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></FormGroup>
        <FormGroup label="Priority"><select className="select-field" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></FormGroup>
        <FormGroup label="Value (₹)"><input className="input-field" type="number" value={form.value} onChange={e => setForm({...form,value:e.target.value})} /></FormGroup>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="My Leads" subtitle={`${myLeads.length} leads`}>
        {hasPermission('leads','create') && <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Lead</button>}
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
                {hasPermission('leads','edit') && <button onClick={() => { setEditTarget(l); setForm({...l}); }} className="p-1.5" style={{ color: 'var(--text-muted)' }}><Edit2 size={14} /></button>}
                {hasPermission('leads','delete') && <button onClick={() => setDeleteTarget(l)} className="p-1.5" style={{ color: 'var(--text-muted)' }}><Trash2 size={14} /></button>}
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

// ─── USER: MY DEALS ──────────────────────────────────────────────────────────
export function UMyDeals() {
  const { currentUser, currentCompany, deals, updateDeal, hasPermission } = useAuth();
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});

  const myDeals = deals.filter(d => d.assignedTo === currentUser?.id || d.companyId === currentCompany?.id);
  const stageColors = { 'Discovery':'#0EA5E9','Qualified':'#6366F1','Proposal':'#F59E0B','Negotiation':'#A855F7','Closed Won':'#10B981','Closed Lost':'#EF4444' };

  return (
    <div className="page-enter">
      <PageHeader title="My Deals" subtitle={`${myDeals.length} deals in pipeline`} />
      {myDeals.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No Deals" description="Your deals will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {myDeals.map(d => {
            const color = stageColors[d.stage] || '#64748B';
            return (
              <div key={d.id} className="card card-hover p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-700 text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full font-700"
                        style={{ background: `${color}15`, color }}>{d.stage}</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{d.contact} · Close: {d.expectedClose}</p>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Value</p>
                        <p className="font-mono font-700 text-sm" style={{ color: '#10B981' }}>₹{d.value?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Probability</p>
                        <p className="font-700 text-sm" style={{ color }}>{d.probability}%</p>
                      </div>
                    </div>
                  </div>
                  {hasPermission('deals','edit') && (
                    <button onClick={() => { setEditTarget(d); setForm({...d}); }} className="btn-secondary text-xs">
                      Update Stage
                    </button>
                  )}
                </div>
                <div className="mt-3">
                  <div className="h-2 rounded-full" style={{ background: 'var(--border-primary)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${d.probability}%`, background: color }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Deal Stage">
        <div className="flex flex-col gap-4">
          <FormGroup label="Stage">
            <select className="select-field" value={form.stage || ''} onChange={e => setForm({...form, stage: e.target.value})}>
              {['Discovery','Qualified','Proposal','Negotiation','Closed Won','Closed Lost'].map(s=><option key={s}>{s}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Probability (%)">
            <input className="input-field" type="number" min="0" max="100" value={form.probability || ''} onChange={e => setForm({...form,probability:Number(e.target.value)})} />
          </FormGroup>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={() => { updateDeal(editTarget.id, form); setEditTarget(null); }}>Save</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── USER: TASKS ─────────────────────────────────────────────────────────────
export function UTasks() {
  const { currentUser, currentCompany, tasks, addTask, updateTask, deleteTask, hasPermission } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', type: 'Task', priority: 'medium', dueDate: '', status: 'pending' });

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id);
  const filtered = myTasks.filter(t => filter === 'all' ? true : filter === 'pending' ? t.status === 'pending' : t.status === 'completed');

  const handleAdd = () => {
    if (!form.title) return;
    addTask({ ...form, companyId: currentCompany.id, assignedTo: currentUser.id });
    setShowAdd(false);
    setForm({ title: '', type: 'Task', priority: 'medium', dueDate: '', status: 'pending' });
  };

  return (
    <div className="page-enter">
      <PageHeader title="My Tasks" subtitle={`${myTasks.filter(t=>t.status==='pending').length} pending`}>
        {hasPermission('tasks','create') && <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Task</button>}
      </PageHeader>

      <div className="flex gap-2 mb-5">
        {['all','pending','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-600 capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(14,165,233,0.15)' : 'transparent',
              color: filter === f ? '#0EA5E9' : 'var(--text-muted)',
              border: `1px solid ${filter === f ? 'rgba(14,165,233,0.3)' : 'var(--border-primary)'}`,
            }}>
            {f} {f === 'all' ? `(${myTasks.length})` : f === 'pending' ? `(${myTasks.filter(t=>t.status==='pending').length})` : `(${myTasks.filter(t=>t.status==='completed').length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title={filter === 'completed' ? 'No completed tasks' : 'No tasks'} description="Your tasks appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(t => {
            const isOverdue = t.status === 'pending' && new Date(t.dueDate) < new Date();
            const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#64748B' };
            return (
              <div key={t.id} className="card card-hover p-4 flex items-center gap-4">
                <button
                  onClick={() => updateTask(t.id, { status: t.status === 'completed' ? 'pending' : 'completed' })}
                  className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all"
                  style={{
                    borderColor: t.status === 'completed' ? '#10B981' : 'var(--border-primary)',
                    background: t.status === 'completed' ? '#10B981' : 'transparent',
                    color: 'white',
                  }}>
                  {t.status === 'completed' && <span style={{ fontSize: 10 }}>✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600" style={{
                    color: t.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                  }}>{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: isOverdue ? '#EF4444' : 'var(--text-muted)' }}>
                      {isOverdue ? '⚠ Overdue — ' : ''}{t.dueDate}
                    </span>
                    <Badge value={t.type} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: priorityColors[t.priority] }}></div>
                  {hasPermission('tasks','delete') && (
                    <button onClick={() => deleteTask(t.id)} className="p-1.5 rounded" style={{ color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Task">
        <div className="flex flex-col gap-4">
          <FormGroup label="Task Title" required><input className="input-field" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Follow up with client..." /></FormGroup>
          <div className="grid grid-cols-3 gap-3">
            <FormGroup label="Type"><select className="select-field" value={form.type} onChange={e => setForm({...form,type:e.target.value})}>{['Call','Email','Meeting','Task'].map(t=><option key={t}>{t}</option>)}</select></FormGroup>
            <FormGroup label="Priority"><select className="select-field" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></FormGroup>
            <FormGroup label="Due Date"><input className="input-field" type="date" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})} /></FormGroup>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Add Task</button></div>
      </Modal>
    </div>
  );
}

// ─── USER: CONTACTS ──────────────────────────────────────────────────────────
export function UContacts() {
  const { currentCompany, leads } = useAuth();
  const [search, setSearch] = useState('');

  const contacts = leads.filter(l => l.companyId === currentCompany?.id).filter(l =>
    l.contact.toLowerCase().includes(search.toLowerCase()) ||
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-enter">
      <PageHeader title="Contacts" subtitle={`${contacts.length} contacts`} />
      <div className="relative max-w-80 mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field pl-9" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {contacts.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No Contacts" description="Contacts from leads appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.map(c => (
            <div key={c.id} className="card card-hover p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-700"
                  style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', color: 'white' }}>
                  {c.contact?.[0] || c.name?.[0]}
                </div>
                <div>
                  <p className="font-700 text-sm" style={{ color: 'var(--text-primary)' }}>{c.contact}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.name}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 mb-3">
                <a href={`mailto:${c.email}`} className="text-xs flex items-center gap-2" style={{ color: '#0EA5E9' }}><Mail size={11} /> {c.email}</a>
                <a href={`tel:${c.phone}`} className="text-xs flex items-center gap-2" style={{ color: '#10B981' }}><Phone size={11} /> {c.phone}</a>
              </div>
              <Badge value={c.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── USER: TICKETS ───────────────────────────────────────────────────────────
export function UTickets() {
  const { currentUser, currentCompany } = useAuth();
  const [tickets, setTickets] = useState([
    { id: 'tk1', title: 'Login issue for client portal', priority: 'high', status: 'open', customer: 'TechCorp', created: '2025-01-12', assignedTo: currentUser?.id },
    { id: 'tk2', title: 'Data export not working', priority: 'medium', status: 'in-progress', customer: 'StartupNest', created: '2025-01-11', assignedTo: currentUser?.id },
    { id: 'tk3', title: 'Invoice not generated', priority: 'low', status: 'resolved', customer: 'MedPlus', created: '2025-01-10', assignedTo: currentUser?.id },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', customer: '', status: 'open' });

  const handleAdd = () => {
    if (!form.title) return;
    setTickets(prev => [...prev, { ...form, id: `tk${Date.now()}`, created: new Date().toISOString().split('T')[0], assignedTo: currentUser.id }]);
    setShowAdd(false);
    setForm({ title: '', priority: 'medium', customer: '', status: 'open' });
  };

  const statusColors = { 'open': '#EF4444', 'in-progress': '#F59E0B', 'resolved': '#10B981' };

  return (
    <div className="page-enter">
      <PageHeader title="Support Tickets" subtitle={`${tickets.filter(t=>t.status!=='resolved').length} open`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> New Ticket</button>
      </PageHeader>

      <div className="flex flex-col gap-3">
        {tickets.map(t => {
          const color = statusColors[t.status] || '#64748B';
          return (
            <div key={t.id} className="card card-hover p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: color }}></div>
                  <div>
                    <p className="font-700 text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge value={t.status} />
                      <Badge value={t.priority} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.customer} · {t.created}</span>
                    </div>
                  </div>
                </div>
                <select
                  value={t.status}
                  onChange={e => setTickets(prev => prev.map(tk => tk.id === t.id ? {...tk, status: e.target.value} : tk))}
                  className="select-field" style={{ width: 130, height: 34, fontSize: 12 }}>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Support Ticket">
        <div className="flex flex-col gap-4">
          <FormGroup label="Issue Title"><input className="input-field" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Describe the issue..." /></FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Customer"><input className="input-field" value={form.customer} onChange={e => setForm({...form,customer:e.target.value})} /></FormGroup>
            <FormGroup label="Priority"><select className="select-field" value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></FormGroup>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Create Ticket</button></div>
      </Modal>
    </div>
  );
}

export default UMyLeads;
