import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import {
  Plus, Search, TrendingUp, Edit2, Trash2, Phone, Mail,
  Zap, Brain, Star, ArrowUpRight, ArrowDownRight, Clock, Tag, Filter,
} from 'lucide-react';

const STATUSES   = ['new', 'contacted', 'qualified', 'proposal', 'lost'];
const SOURCES    = ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Event', 'Ad', 'Instagram', 'Other'];
const PRIORITIES = ['high', 'medium', 'low'];

const STATUS_COLOR = { new: '#0EA5E9', contacted: '#6366F1', qualified: '#F59E0B', proposal: '#A855F7', lost: '#EF4444' };
const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#64748B' };

/* AI-like lead score based on value, priority, status */
function getLeadScore(lead) {
  let score = 0;
  if (lead.priority === 'high')   score += 40;
  if (lead.priority === 'medium') score += 20;
  if (lead.status === 'proposal') score += 30;
  if (lead.status === 'qualified') score += 20;
  if (lead.status === 'contacted') score += 10;
  if ((lead.value || 0) > 100000) score += 20;
  else if ((lead.value || 0) > 50000) score += 10;
  return Math.min(score, 99);
}

function ScoreBadge({ score }) {
  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `2.5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color }}>{score}</span>
      </div>
    </div>
  );
}

export default function CALeads() {
  const { currentCompany, leads, users, addLead, updateLead, deleteLead } = useAuth();
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showAdd, setShowAdd]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode]       = useState('table');
  const [sortBy, setSortBy]           = useState('score'); // score | value | date

  const defaultForm = { name: '', contact: '', email: '', phone: '', status: 'new', source: 'Website', value: '', priority: 'medium', assignedTo: '', tags: [] };
  const [form, setForm] = useState(defaultForm);

  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id && ['sales', 'manager', 'marketing', 'customer_success'].includes(u.role));

  const filtered = useMemo(() => {
    let arr = companyLeads.filter(l => {
      const matchSearch   = l.name.toLowerCase().includes(search.toLowerCase()) || l.contact.toLowerCase().includes(search.toLowerCase());
      const matchStatus   = filterStatus   === 'all' || l.status   === filterStatus;
      const matchPriority = filterPriority === 'all' || l.priority === filterPriority;
      const matchSource   = filterSource   === 'all' || l.source   === filterSource;
      return matchSearch && matchStatus && matchPriority && matchSource;
    });
    if (sortBy === 'score') arr = [...arr].sort((a, b) => getLeadScore(b) - getLeadScore(a));
    if (sortBy === 'value') arr = [...arr].sort((a, b) => (b.value || 0) - (a.value || 0));
    return arr;
  }, [companyLeads, search, filterStatus, filterPriority, filterSource, sortBy]);

  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unassigned';

  const totalLeadValue = companyLeads.reduce((s, l) => s + (l.value || 0), 0);
  const hotLeads       = companyLeads.filter(l => getLeadScore(l) >= 70).length;
  const sources        = [...new Set(companyLeads.map(l => l.source))];

  const handleAdd = () => {
    if (!form.name) return;
    addLead({ ...form, companyId: currentCompany.id, value: Number(form.value) || 0 });
    setShowAdd(false); setForm(defaultForm);
  };
  const handleEdit = () => {
    updateLead(editTarget.id, { ...form, value: Number(form.value) });
    setEditTarget(null);
  };
  const openEdit = (l) => { setEditTarget(l); setForm({ ...l }); };

  const LeadForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Company / Lead Name" required>
          <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Acme Corp" />
        </FormGroup>
        <FormGroup label="Contact Person">
          <input className="input-field" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="John Doe" />
        </FormGroup>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Email">
          <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@acme.com" />
        </FormGroup>
        <FormGroup label="Phone">
          <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" />
        </FormGroup>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Lead Value (₹)">
          <input className="input-field" type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="50000" />
        </FormGroup>
        <FormGroup label="Assign To">
          <select className="select-field" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
            <option value="">Unassigned</option>
            {companyUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </FormGroup>
      </div>
    </div>
  );

  const KanbanBoard = () => (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
      {STATUSES.map(status => {
        const colLeads = filtered.filter(l => l.status === status);
        const colValue = colLeads.reduce((s, l) => s + (l.value || 0), 0);
        const color = STATUS_COLOR[status] || '#64748B';
        return (
          <div key={status} style={{ flexShrink: 0, width: 272 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px',
              borderRadius: '12px 12px 0 0', background: `${color}12`, border: `1px solid ${color}25`, borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color }}>{status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${color}20`, color }}>{colLeads.length}</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>₹{(colValue/1000).toFixed(0)}K</span>
              </div>
            </div>
            <div style={{ minHeight: 120, padding: 8, background: 'var(--bg-secondary)', border: `1px solid ${color}20`, borderTop: 'none', borderRadius: '0 0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {colLeads.map(l => {
                const score = getLeadScore(l);
                const scoreColor = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
                return (
                  <div key={l.id} className="pipeline-card" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '12px 0 0 12px', background: color }} />
                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1, paddingRight: 4 }}>{l.name}</p>
                        <button onClick={() => openEdit(l)} style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>{l.contact}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#10B981' }}>₹{(l.value||0).toLocaleString()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 8, fontWeight: 800, color: scoreColor }}>{score}</span>
                          </div>
                          <Badge value={l.priority} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page-enter">
      {/* Header */}
      <PageHeader title="Leads Intelligence" subtitle={`${companyLeads.length} total leads · ₹${(totalLeadValue/1000).toFixed(0)}K total value`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Lead
        </button>
      </PageHeader>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total Leads',   value: companyLeads.length,                                      color: '#0EA5E9' },
          { label: 'Hot Leads 🔥',  value: hotLeads,                                                  color: '#EF4444' },
          { label: 'Pipeline Value',value: `₹${(totalLeadValue/1000).toFixed(0)}K`,                  color: '#10B981' },
          { label: 'In Proposal',   value: companyLeads.filter(l=>l.status==='proposal').length,      color: '#A855F7' },
          { label: 'Lost',          value: companyLeads.filter(l=>l.status==='lost').length,          color: '#64748B' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '10px 14px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 5 }}>{k.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          background: filterStatus === 'all' ? 'var(--bg-card)' : 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}>
          All ({companyLeads.length})
        </button>
        {STATUSES.map(s => {
          const count = companyLeads.filter(l => l.status === s).length;
          const color = STATUS_COLOR[s];
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                background: filterStatus === s ? `${color}20` : `${color}0A`,
                color, border: `1px solid ${filterStatus === s ? color + '50' : color + '20'}` }}>
              {count} {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Controls Row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 34 }} placeholder="Search leads or contacts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 130 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
        </select>
        <select className="select-field" style={{ width: 140 }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select-field" style={{ width: 140 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="score">Sort: AI Score</option>
          <option value="value">Sort: Value</option>
          <option value="date">Sort: Date</option>
        </select>
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {['table', 'kanban'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s',
              background: viewMode === m ? 'var(--bg-card)' : 'transparent', color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              border: viewMode === m ? '1px solid var(--border-primary)' : '1px solid transparent' }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'kanban' ? (
        filtered.length === 0
          ? <EmptyState icon={TrendingUp} title="No Leads" description="Add your first lead to get started." />
          : <KanbanBoard />
      ) : filtered.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No Leads Found" description="Try adjusting your filters." />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Brain size={11} style={{ color: '#A855F7' }} /> AI Score
                  </th>
                  <th>Lead</th><th>Contact</th><th>Status</th><th>Value</th><th>Priority</th>
                  <th>Source</th><th>Assigned To</th><th>Last Contact</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const score = getLeadScore(l);
                  return (
                    <tr key={l.id}>
                      <td><ScoreBadge score={score} /></td>
                      <td>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{l.name}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.email}</p>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{l.contact}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: `${STATUS_COLOR[l.status] || '#64748B'}15`, color: STATUS_COLOR[l.status] || '#64748B' }}>
                          {l.status}
                        </span>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10B981' }}>₹{l.value?.toLocaleString()}</span></td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: `${PRIORITY_COLOR[l.priority] || '#64748B'}15`, color: PRIORITY_COLOR[l.priority] || '#64748B' }}>
                          {l.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: 11 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>{l.source}</span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{getUserName(l.assignedTo)}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.lastContact}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <a href={`tel:${l.phone}`} style={{ padding: 5, borderRadius: 7, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex' }} title="Call"><Phone size={12} /></a>
                          <a href={`mailto:${l.email}`} style={{ padding: 5, borderRadius: 7, background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', display: 'flex' }} title="Email"><Mail size={12} /></a>
                          <button onClick={() => openEdit(l)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                          <button onClick={() => setDeleteTarget(l)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Lead" width={580}>
        <LeadForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Lead</button>
        </div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Lead" width={580}>
        <LeadForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteLead(deleteTarget?.id)} title="Delete Lead" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
