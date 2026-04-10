import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import {
  Plus, Search, Phone, Mail, Edit2, Trash2,
  Tag, Globe, Star, LayoutGrid, List, ArrowUpRight,
  Building2, UserCheck, TrendingUp, MessageSquare,
} from 'lucide-react';

const SOURCES    = ['Website','LinkedIn','Referral','Cold Call','Event','Ad','Instagram','Other'];
const STATUSES   = ['new','contacted','qualified','proposal','lost'];
const STATUS_COLOR = { new:'#0EA5E9', contacted:'#6366F1', qualified:'#F59E0B', proposal:'#A855F7', lost:'#EF4444' };

/* Relationship health score based on status + priority + value */
function getHealthScore(c) {
  let score = 50;
  if (c.status === 'qualified') score += 25;
  if (c.status === 'proposal')  score += 35;
  if (c.status === 'contacted') score += 10;
  if (c.status === 'lost')      score -= 30;
  if (c.priority === 'high')    score += 15;
  if ((c.value || 0) > 100000)  score += 10;
  return Math.max(10, Math.min(score, 99));
}

function HealthRing({ score }) {
  const color = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Healthy' : score >= 50 ? 'Fair' : 'At Risk';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `2.5px solid ${color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
      </div>
      <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

/* Gradient avatar seeded by name */
const AVATAR_GRADIENTS = [
  ['#0EA5E9','#6366F1'], ['#A855F7','#EC4899'], ['#F59E0B','#EF4444'],
  ['#10B981','#0EA5E9'], ['#F97316','#A855F7'], ['#14B8A6','#0EA5E9'],
];
function avatarGrad(name) {
  const i = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return `linear-gradient(135deg, ${AVATAR_GRADIENTS[i][0]}, ${AVATAR_GRADIENTS[i][1]})`;
}

export default function CAContacts() {
  const { currentCompany, leads, addLead, updateLead, deleteLead } = useAuth();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showAdd, setShowAdd]           = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode]         = useState('grid');

  const defaultForm = { name:'', contact:'', email:'', phone:'', status:'new', source:'Website', value:'', priority:'medium', tags:[] };
  const [form, setForm] = useState(defaultForm);

  const contacts = leads.filter(l => l.companyId === currentCompany?.id);
  const sources  = [...new Set(contacts.map(c => c.source).filter(Boolean))];

  const filtered = useMemo(() => contacts.filter(c => {
    const matchSearch  = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchSource = filterSource === 'all' || c.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  }), [contacts, search, filterStatus, filterSource]);

  const totalValue   = contacts.reduce((s, c) => s + (c.value || 0), 0);
  const hotContacts  = contacts.filter(c => c.priority === 'high').length;

  const handleAdd = () => {
    if (!form.name || !form.contact) return;
    addLead({ ...form, companyId: currentCompany.id, value: Number(form.value) || 0 });
    setShowAdd(false); setForm(defaultForm);
  };
  const handleEdit = () => {
    updateLead(editTarget.id, { ...form, value: Number(form.value) });
    setEditTarget(null);
  };
  const openEdit = (c) => { setEditTarget(c); setForm({ ...c, tags: c.tags || [] }); };

  const ContactForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Company Name" required>
          <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Acme Corp" />
        </FormGroup>
        <FormGroup label="Contact Person" required>
          <input className="input-field" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="Jane Doe" />
        </FormGroup>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Email">
          <input className="input-field" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@acme.com" />
        </FormGroup>
        <FormGroup label="Phone">
          <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210" />
        </FormGroup>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <FormGroup label="Relationship Status">
          <select className="select-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Source">
          <select className="select-field" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Potential Value (₹)">
          <input className="input-field" type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="50000" />
        </FormGroup>
      </div>
      <FormGroup label="Tags (comma separated)">
        <input className="input-field" value={(form.tags||[]).join(',')}
          onChange={e => setForm({...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
          placeholder="B2B, Tech, Enterprise" />
      </FormGroup>
    </div>
  );

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <UserCheck size={14} style={{ color: '#14B8A6' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#14B8A6' }}>Relationship Intelligence</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Contacts</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {contacts.length} contacts · ₹{(totalValue/1000).toFixed(0)}K total potential value
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Contact
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total Contacts',  value: contacts.length,                                           color: '#14B8A6' },
          { label: 'Hot Contacts 🔥', value: hotContacts,                                               color: '#EF4444' },
          { label: 'Qualified',       value: contacts.filter(c=>c.status==='qualified').length,          color: '#F59E0B' },
          { label: 'Total Potential', value: `₹${(totalValue/1000).toFixed(0)}K`,                       color: '#10B981' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '10px 14px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 5 }}>{k.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Status pills */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setFilterStatus('all')} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
          background: filterStatus==='all' ? 'var(--bg-card)' : 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}>
          All ({contacts.length})
        </button>
        {STATUSES.map(s => {
          const count = contacts.filter(c => c.status === s).length;
          const color = STATUS_COLOR[s];
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: filterStatus===s ? `${color}20` : `${color}0A`, color,
                border: `1px solid ${filterStatus===s ? color+'50' : color+'20'}` }}>
              {count} {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 34 }} placeholder="Search contacts, companies..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 140 }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {['grid', 'list'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: viewMode===m ? 'var(--bg-card)' : 'transparent', color: viewMode===m ? 'var(--text-primary)' : 'var(--text-muted)',
              border: viewMode===m ? '1px solid var(--border-primary)' : '1px solid transparent' }}>
              {m === 'grid' ? <LayoutGrid size={13} /> : <List size={13} />}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={UserCheck} title="No Contacts Found" description="Add contacts to build your business relationships."
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Contact</button>} />
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(c => {
            const score = getHealthScore(c);
            const sColor = STATUS_COLOR[c.status] || '#64748B';
            return (
              <div key={c.id} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Color stripe */}
                <div style={{ height: 3, background: sColor }} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: avatarGrad(c.contact || 'A'),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
                        {(c.contact?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.contact}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Building2 size={9} style={{ color: 'var(--text-muted)' }} />
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.name}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button onClick={() => openEdit(c)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                      <button onClick={() => setDeleteTarget(c)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color='#EF4444'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}><Trash2 size={12} /></button>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color='#0EA5E9'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                        <Mail size={11} /> {c.email}
                      </a>
                    )}
                    {c.phone && (
                      <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color='#10B981'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                        <Phone size={11} /> {c.phone}
                      </a>
                    )}
                  </div>

                  {/* Tags */}
                  {c.tags?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {c.tags.map(tag => (
                        <span key={tag} style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-primary)' }}>
                    <HealthRing score={score} />
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.source}</p>
                      {c.value > 0 && <p style={{ fontSize: 13, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>₹{c.value.toLocaleString()}</p>}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <a href={`tel:${c.phone}`} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700, borderRadius: 8, textAlign: 'center', textDecoration: 'none',
                      background: 'rgba(16,185,129,0.1)', color: '#10B981', cursor: 'pointer' }}>📞 Call</a>
                    <a href={`mailto:${c.email}`} style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700, borderRadius: 8, textAlign: 'center', textDecoration: 'none',
                      background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', cursor: 'pointer' }}>✉️ Email</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Health</th><th>Contact</th><th>Company</th><th>Status</th><th>Value</th><th>Source</th><th>Tags</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><HealthRing score={getHealthScore(c)} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarGrad(c.contact||'A'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {(c.contact?.[0]||'?').toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{c.contact}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{c.name}</td>
                    <td><span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${STATUS_COLOR[c.status]||'#64748B'}15`, color: STATUS_COLOR[c.status]||'#64748B' }}>{c.status}</span></td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10B981' }}>{c.value ? `₹${c.value.toLocaleString()}` : '—'}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.source}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(c.tags||[]).map(t => <span key={t} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>{t}</span>)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 3 }}>
                        <a href={`tel:${c.phone}`} style={{ padding: 5, borderRadius: 7, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex' }}><Phone size={12} /></a>
                        <a href={`mailto:${c.email}`} style={{ padding: 5, borderRadius: 7, background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', display: 'flex' }}><Mail size={12} /></a>
                        <button onClick={() => openEdit(c)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                        <button onClick={() => setDeleteTarget(c)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color='#EF4444'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Contact" width={560}>
        <ContactForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Contact</button>
        </div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Contact" width={560}>
        <ContactForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteLead(deleteTarget?.id)} title="Remove Contact" message={`Remove "${deleteTarget?.contact}" from contacts?`} />
    </div>
  );
}