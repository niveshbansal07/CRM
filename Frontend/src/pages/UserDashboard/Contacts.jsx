import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, EmptyState, Modal, FormGroup, ConfirmDialog } from '../../components/common';
import { Users, Search, Mail, Phone, Plus, Edit2, Trash2, Building2, Briefcase } from 'lucide-react';

const DEPARTMENTS = [
  'Executive','Sales','Marketing','Finance','Human Resources','Operations',
  'Customer Support','Customer Success','Legal & Compliance','Technology','Management','Other',
];

/* ─── Avatar gradient pool by first letter ─────────── */
const AVATAR_GRADIENTS = [
  ['#0EA5E9','#6366F1'], ['#10B981','#0EA5E9'], ['#F59E0B','#EF4444'],
  ['#A855F7','#EC4899'], ['#14B8A6','#6366F1'], ['#F97316','#EF4444'],
];
function avatarGradient(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  const [c1, c2] = AVATAR_GRADIENTS[idx];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

const EMPTY_FORM = { name: '', department: '', designation: '', email: '', phone: '' };

export default function UContacts() {
  const { currentUser, currentCompany, users, addUser, updateUser, deleteUser } = useAuth();

  const isAdmin = currentUser?.role === 'company_admin';

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ─── Source: only this org's users (active or suspended) ─── */
  const orgUsers = useMemo(() =>
    users
      .filter(u => u.companyId === currentCompany?.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [users, currentCompany]
  );

  /* ─── Filter ─── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.designation?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }, [orgUsers, search]);

  /* ─── Alphabetical grouping ─── */
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(u => {
      const letter = u.name[0].toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(u);
    });
    return g;
  }, [filtered]);

  /* ─── Validation ─── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Name is required';
    if (!form.department.trim())  e.department  = 'Department is required';
    if (!form.designation.trim()) e.designation = 'Designation is required';
    if (!form.email.trim())       e.email       = 'Company email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─── Handlers ─── */
  const handleAdd = () => {
    if (!validate()) return;
    addUser({
      ...form,
      companyId: currentCompany.id,
      role: 'sales',          // default role — admin can update from Employees page
      status: 'active',
      password: 'user123',    // default password
    });
    setShowAdd(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleEdit = () => {
    if (!validate()) return;
    updateUser(editTarget.id, {
      name: form.name,
      department: form.department,
      designation: form.designation,
      email: form.email,
      phone: form.phone,
    });
    setEditTarget(null);
    setErrors({});
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setForm({ name: u.name, department: u.department || '', designation: u.designation || '', email: u.email, phone: u.phone || '' });
    setErrors({});
  };

  const handleDelete = () => {
    deleteUser(deleteTarget.id);
    setDeleteTarget(null);
  };

  /* ─── Form component ─── */
  const ContactForm = () => (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <FormGroup label="Full Name" required>
        <input className={`input-field ${errors.name ? 'border-red-500' : ''}`}
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Priya Sharma" />
        {errors.name && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.name}</p>}
      </FormGroup>

      <div className="grid grid-cols-2 gap-3">
        {/* Department */}
        <FormGroup label="Department" required>
          <select className={`select-field ${errors.department ? 'border-red-500' : ''}`}
            value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
            <option value="">Select department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.department}</p>}
        </FormGroup>

        {/* Designation */}
        <FormGroup label="Designation" required>
          <input className={`input-field ${errors.designation ? 'border-red-500' : ''}`}
            value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
            placeholder="e.g. Senior Sales Manager" />
          {errors.designation && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.designation}</p>}
        </FormGroup>
      </div>

      {/* Company Email */}
      <FormGroup label="Company Email" required>
        <input type="email" className={`input-field ${errors.email ? 'border-red-500' : ''}`}
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          placeholder={`e.g. priya@${currentCompany?.domain || 'company.com'}`} />
        {errors.email && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>}
      </FormGroup>

      {/* Phone — optional */}
      <FormGroup label="Phone Number" hint="Optional">
        <input className="input-field" value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98765 43210" />
      </FormGroup>
    </div>
  );

  /* ─── Contact Card ─── */
  const ContactCard = ({ u }) => {
    const avatarText = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
      <div className="rounded-2xl p-5 flex flex-col gap-4 group transition-all relative"
           style={{
             background: 'var(--bg-card)',
             border: '1px solid var(--border-primary)',
             boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
           }}
           onMouseEnter={e => e.currentTarget.style.borderColor = '#6366F130'}
           onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}>

        {/* Admin actions */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(u)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(14,165,233,0.12)', color: '#0EA5E9' }}
              title="Edit contact">
              <Edit2 size={13} />
            </button>
            <button onClick={() => setDeleteTarget(u)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
              title="Remove contact">
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {/* Avatar + Name + Designation */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-700 text-lg flex-shrink-0"
               style={{ background: avatarGradient(u.name) }}>
            {avatarText}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-700 text-base leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {u.name}
            </p>
            {u.designation && (
              <p className="text-xs mt-0.5 truncate flex items-center gap-1.5" style={{ color: '#6366F1' }}>
                <Briefcase size={11} />
                {u.designation}
              </p>
            )}
          </div>
        </div>

        {/* Department + Company badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {u.department && (
            <span className="inline-flex items-center gap-1.5 text-xs font-600 px-2.5 py-1 rounded-lg"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
              <Building2 size={11} />
              {u.department}
            </span>
          )}
          <span className="inline-flex items-center text-xs font-600 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
            {currentCompany?.name}
          </span>
        </div>

        {/* Contact details */}
        <div className="flex flex-col gap-2">
          <a href={`mailto:${u.email}`}
             className="text-xs flex items-center gap-2 truncate transition-colors hover:opacity-80"
             style={{ color: 'var(--text-secondary)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                 style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
              <Mail size={12} />
            </div>
            <span className="truncate">{u.email}</span>
          </a>

          {u.phone ? (
            <a href={`tel:${u.phone}`}
               className="text-xs flex items-center gap-2 truncate transition-colors hover:opacity-80"
               style={{ color: 'var(--text-secondary)' }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <Phone size={12} />
              </div>
              <span>{u.phone}</span>
            </a>
          ) : (
            <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                   style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                <Phone size={12} />
              </div>
              <span>No phone on file</span>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <a href={`mailto:${u.email}`}
             className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-700 transition-colors"
             style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
            <Mail size={12} /> Email
          </a>
          {u.phone && (
            <a href={`tel:${u.phone}`}
               className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-700 transition-colors"
               style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Phone size={12} /> Call
            </a>
          )}
        </div>
      </div>
    );
  };

  /* ─── Render ─── */
  return (
    <div className="page-enter">
      <PageHeader
        title="Organisation Contacts"
        subtitle={`${orgUsers.length} member${orgUsers.length !== 1 ? 's' : ''} · ${currentCompany?.name || ''}`}>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowAdd(true); }}>
            <Plus size={15} /> Add Contact
          </button>
        )}
      </PageHeader>

      {/* Search bar */}
      <div className="mb-7 relative max-w-md">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input className="input-field pl-11 py-2.5"
          placeholder="Search by name, department, designation or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Count pill */}
      {search && (
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}

      {/* Alpha groups */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users}
          title={search ? 'No contacts match your search' : 'No contacts yet'}
          description={isAdmin ? 'Click "Add Contact" to add organisation members.' : 'Contact your company admin to add team members.'}
          action={isAdmin && !search && (
            <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowAdd(true); }}>
              <Plus size={14} /> Add Contact
            </button>
          )}
        />
      ) : (
        <div className="flex flex-col gap-10">
          {Object.keys(grouped).sort().map(letter => (
            <div key={letter} className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
              {/* Letter heading */}
              <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center sticky top-4 font-display font-800 text-xl"
                   style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                {letter}
              </div>

              {/* Cards grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {grouped[letter].map(u => <ContactCard key={u.id} u={u} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Contact Modal ── */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setErrors({}); }} title="Add Team Member" width={520}>
        <ContactForm />
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => { setShowAdd(false); setErrors({}); }}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}><Plus size={14} /> Add Contact</button>
        </div>
      </Modal>

      {/* ── Edit Contact Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => { setEditTarget(null); setErrors({}); }} title="Edit Contact" width={520}>
        <ContactForm />
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => { setEditTarget(null); setErrors({}); }}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Contact"
        message={`Remove "${deleteTarget?.name}" from the contacts directory? This does not delete their user account.`}
      />
    </div>
  );
}
