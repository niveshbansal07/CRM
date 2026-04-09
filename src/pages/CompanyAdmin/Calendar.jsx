import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { Plus, Search, Contact, Phone, Mail, Edit2, Trash2, Star, Tag } from 'lucide-react';

const SOURCES = ['Website','LinkedIn','Referral','Cold Call','Event','Ad','Instagram','Other'];

export default function CAContacts() {
  const { currentCompany, leads, addLead, updateLead, deleteLead } = useAuth();
  const [search, setSearch]     = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [showAdd, setShowAdd]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [view, setView]         = useState('grid'); // grid | list

  const defaultForm = { name:'', contact:'', email:'', phone:'', status:'new', source:'Website', value:'', priority:'medium', tags:[] };
  const [form, setForm] = useState(defaultForm);

  // Contacts = leads of this company
  const contacts = leads.filter(l => l.companyId === currentCompany?.id);
  const allTags   = [...new Set(contacts.flatMap(c => c.tags || []))];

  const filtered = contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTag = filterTag === 'all' || (c.tags || []).includes(filterTag);
    return matchSearch && matchTag;
  });

  const handleAdd = () => {
    if (!form.name || !form.contact) return;
    addLead({ ...form, companyId: currentCompany.id, value: Number(form.value) || 0 });
    setShowAdd(false);
    setForm(defaultForm);
  };

  const handleEdit = () => {
    updateLead(editTarget.id, { ...form, value: Number(form.value) });
    setEditTarget(null);
  };

  const openEdit = (c) => { setEditTarget(c); setForm({ ...c, tags: c.tags || [] }); };

  const ContactForm = () => (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Company Name" required>
          <input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Acme Corp" />
        </FormGroup>
        <FormGroup label="Contact Person" required>
          <input className="input-field" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} placeholder="Jane Doe" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Email">
          <input className="input-field" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        </FormGroup>
        <FormGroup label="Phone">
          <input className="input-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 9876543210" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormGroup label="Status">
          <select className="select-field" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
            {['new','contacted','qualified','proposal','lost'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Source">
          <select className="select-field" value={form.source} onChange={e=>setForm({...form,source:e.target.value})}>
            {SOURCES.map(s=><option key={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Lead Value (₹)">
          <input className="input-field" type="number" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} placeholder="50000" />
        </FormGroup>
      </div>
      <FormGroup label="Tags (comma separated)">
        <input className="input-field" value={(form.tags||[]).join(',')}
          onChange={e=>setForm({...form, tags: e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})}
          placeholder="B2B, Tech, Enterprise" />
      </FormGroup>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="Contacts" subtitle={`${contacts.length} total contacts`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Contact</button>
      </PageHeader>

      {/* Stats row */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {[
          { label:'All',        count: contacts.length,                                 value:'all',   color:'#64748B' },
          { label:'New',        count: contacts.filter(c=>c.status==='new').length,     value:'new',   color:'#0EA5E9' },
          { label:'Qualified',  count: contacts.filter(c=>c.status==='qualified').length, value:'qualified', color:'#F59E0B' },
          { label:'Hot Leads',  count: contacts.filter(c=>c.priority==='high').length,  value:'high',  color:'#EF4444' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background:s.color }}></div>
            <span className="font-700 text-sm" style={{ color:'var(--text-primary)' }}>{s.count}</span>
            <span className="text-xs" style={{ color:'var(--text-muted)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search contacts..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        {allTags.length > 0 && (
          <select className="select-field" style={{ width:140 }} value={filterTag} onChange={e=>setFilterTag(e.target.value)}>
            <option value="all">All Tags</option>
            {allTags.map(t=><option key={t}>{t}</option>)}
          </select>
        )}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-primary)' }}>
          {['grid','list'].map(m=>(
            <button key={m} onClick={()=>setView(m)} className="px-3 py-1.5 rounded-md text-xs font-600 capitalize transition-all"
              style={{ background: view===m ? 'var(--bg-card)':'transparent', color: view===m ? 'var(--text-primary)':'var(--text-muted)' }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Contact} title="No Contacts Found" description="Add your first contact to build your database." action={<button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus size={14} /> Add Contact</button>} />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <div key={c.id} className="card card-hover p-4 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-700 flex-shrink-0"
                    style={{ background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'white' }}>
                    {c.contact?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-700 text-sm" style={{ color:'var(--text-primary)' }}>{c.contact}</p>
                    <p className="text-xs" style={{ color:'var(--text-muted)' }}>{c.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEdit(c)} className="p-1 rounded" style={{ color:'var(--text-muted)' }}><Edit2 size={13} /></button>
                  <button onClick={()=>setDeleteTarget(c)} className="p-1 rounded" style={{ color:'var(--text-muted)' }}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-col gap-1.5 mb-3">
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs transition-colors" style={{ color:'var(--text-muted)' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#0EA5E9'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                  <Mail size={11} /> {c.email}
                </a>}
                {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs transition-colors" style={{ color:'var(--text-muted)' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#10B981'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                  <Phone size={11} /> {c.phone}
                </a>}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop:'1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge value={c.status} />
                  {c.priority === 'high' && <span className="badge" style={{ background:'rgba(239,68,68,0.1)', color:'#EF4444' }}>HOT</span>}
                </div>
                <span className="font-mono text-xs font-700" style={{ color:'#10B981' }}>
                  {c.value ? `₹${c.value.toLocaleString()}` : '—'}
                </span>
              </div>

              {/* Tags */}
              {c.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.tags.map(tag=>(
                    <span key={tag} className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                      style={{ background:'rgba(99,102,241,0.08)', color:'#6366F1' }}>
                      <Tag size={9} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Contact</th><th>Company</th><th>Email</th><th>Phone</th><th>Status</th><th>Value</th><th>Tags</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                          style={{ background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'white' }}>
                          {c.contact?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-600 text-sm" style={{ color:'var(--text-primary)' }}>{c.contact}</p>
                      </div>
                    </td>
                    <td style={{ fontSize:12 }}>{c.name}</td>
                    <td><a href={`mailto:${c.email}`} className="text-xs" style={{ color:'#0EA5E9' }}>{c.email}</a></td>
                    <td><a href={`tel:${c.phone}`} className="text-xs" style={{ color:'#10B981' }}>{c.phone}</a></td>
                    <td><Badge value={c.status} /></td>
                    <td><span className="font-mono text-xs font-600" style={{ color:'#10B981' }}>{c.value?`₹${c.value.toLocaleString()}`:'—'}</span></td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(c.tags||[]).map(t=><span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background:'rgba(99,102,241,0.08)', color:'#6366F1' }}>{t}</span>)}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg" style={{ color:'var(--text-muted)' }}><Edit2 size={13} /></button>
                        <button onClick={()=>setDeleteTarget(c)} className="p-1.5 rounded-lg" style={{ color:'var(--text-muted)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={()=>setShowAdd(false)} title="Add Contact" width={560}>
        <ContactForm />
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Add Contact</button></div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={()=>setEditTarget(null)} title="Edit Contact" width={560}>
        <ContactForm />
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={()=>setEditTarget(null)}>Cancel</button><button className="btn-primary" onClick={handleEdit}>Save</button></div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={()=>setDeleteTarget(null)} onConfirm={()=>deleteLead(deleteTarget?.id)} title="Delete Contact" message={`Remove "${deleteTarget?.contact}" from contacts?`} />
    </div>
  );
}