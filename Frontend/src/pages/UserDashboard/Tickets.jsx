import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import {
  Ticket, Plus, Search, Clock, CheckCircle2, AlertCircle,
  Edit2, Trash2, Flame, MessageSquare, User, ChevronDown, Filter,
} from 'lucide-react';

const PRIORITIES = ['high', 'medium', 'low'];
const STATUSES   = ['open', 'in-progress', 'resolved'];
const STATUS_COLORS   = { 'open': '#EF4444', 'in-progress': '#F59E0B', 'resolved': '#10B981' };
const PRIORITY_COLORS = { 'high': '#EF4444', 'medium': '#F59E0B', 'low': '#64748B' };

/* ─── Shared ticket card ─────────────────────────────────────────────────── */
function TicketCard({ t, isSupport, onEdit, onDelete, onResolve, users }) {
  const statusColor = STATUS_COLORS[t.status];
  const raiser = users?.find(u => u.id === t.createdBy);
  return (
    <div className="card card-hover p-4 border-l-4 transition-all" style={{ borderLeftColor: statusColor }}>
      <div className="flex items-start justify-between gap-4">
        {/* Left */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: `${statusColor}15`, color: statusColor }}>
            <Ticket size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-700 text-sm truncate" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
              {t.priority === 'high' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-800 px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 uppercase flex-shrink-0">
                  <Flame size={10} /> Urgent
                </span>
              )}
            </div>
            {t.description && (
              <p className="text-xs mb-2 leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{t.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-600 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{t.id}</span>
              {t.customer && <span className="font-700" style={{ color: 'var(--text-primary)' }}>{t.customer}</span>}
              <span>· {t.created}</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[t.priority] }} />
                <span className="capitalize">{t.priority} priority</span>
              </span>
              {isSupport && raiser && (
                <span className="flex items-center gap-1">
                  <User size={11} />
                  Raised by <strong style={{ color: 'var(--text-primary)' }}>{raiser.name}</strong>
                </span>
              )}
            </div>
            {/* Resolution comment */}
            {t.status === 'resolved' && t.comment && (
              <div className="mt-2 px-3 py-2 rounded-lg text-xs flex items-start gap-2"
                   style={{ background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10B981' }}>
                <MessageSquare size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong className="text-emerald-500">Support note:</strong> {t.comment}
                  {t.resolvedByName && <span className="text-muted"> — {t.resolvedByName} on {t.resolvedAt}</span>}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Status badge / dropdown */}
          {isSupport ? (
            <select value={t.status}
              onChange={e => onEdit(t.id, { status: e.target.value })}
              className="select-field text-xs font-700 py-1 pl-2 pr-7 focus:ring-0"
              style={{ width: 'auto', height: 32, borderColor: statusColor, color: statusColor, background: `${statusColor}0A` }}>
              {STATUSES.map(s => (
                <option key={s} value={s} style={{ color: '#000', background: '#fff' }}>
                  {s.replace('-', ' ')}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-700 px-2 py-1 rounded-full capitalize"
                  style={{ background: `${statusColor}15`, color: statusColor }}>
              {t.status.replace('-', ' ')}
            </span>
          )}

          <div className="flex items-center gap-1">
            {/* Support: resolve button */}
            {isSupport && t.status !== 'resolved' && (
              <button onClick={() => onResolve(t)}
                className="flex items-center gap-1 text-xs font-700 px-2 py-1 rounded-lg transition-colors"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <CheckCircle2 size={13} /> Resolve
              </button>
            )}
            {/* Edit (support only for now) */}
            {isSupport && (
              <button onClick={() => onEdit(t.id, null, true)}
                className="p-1.5 rounded hover:bg-white/5 transition-colors" 
                style={{ color: 'var(--text-muted)' }} title="Edit">
                <Edit2 size={14} />
              </button>
            )}
            {/* Delete own tickets */}
            {!isSupport && t.status === 'open' && (
              <button onClick={() => onDelete(t)}
                className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                style={{ color: 'var(--text-muted)' }} title="Cancel ticket">
                <Trash2 size={14} />
              </button>
            )}
            {isSupport && (
              <button onClick={() => onDelete(t)}
                className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                style={{ color: 'var(--text-muted)' }} title="Delete">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
export default function UTickets() {
  const { currentUser, currentCompany, tickets, addTicket, updateTicket, deleteTicket, resolveTicket, users } = useAuth();

  const isSupport = currentUser?.role === 'support' || currentUser?.role === 'company_admin';

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // { id, directUpdate }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resolveTarget, setResolveTarget] = useState(null); // ticket to resolve
  const [resolveComment, setResolveComment] = useState('');

  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', customer: '' });

  // ── Filter tickets by company + role scope ──
  const myTicketIds = useMemo(() =>
    tickets.filter(t => t.companyId === currentCompany?.id && !isSupport && t.createdBy === currentUser?.id)
           .map(t => t.id), [tickets, currentCompany, currentUser, isSupport]);

  const visibleTickets = useMemo(() => {
    return tickets
      .filter(t => {
        if (t.companyId !== currentCompany?.id) return false;
        // Non-support sees only own tickets
        if (!isSupport && t.createdBy !== currentUser?.id) return false;
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
        if (search) {
          const q = search.toLowerCase();
          return t.title.toLowerCase().includes(q) || t.customer?.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
  }, [tickets, currentCompany, currentUser, isSupport, filterStatus, filterPriority, search]);

  // KPIs
  const companyTickets = tickets.filter(t => t.companyId === currentCompany?.id);
  const openCount      = companyTickets.filter(t => t.status === 'open').length;
  const inProgCount    = companyTickets.filter(t => t.status === 'in-progress').length;
  const resolvedCount  = companyTickets.filter(t => t.status === 'resolved').length;

  // ── Handlers ──
  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTicket({ ...form });
    setShowAdd(false);
    setForm({ title: '', description: '', priority: 'medium', customer: '' });
  };

  const handleEdit = (id, directUpdate, openModal) => {
    if (directUpdate) {
      // inline status change from dropdown
      updateTicket(id, directUpdate);
    } else if (openModal) {
      const t = tickets.find(tk => tk.id === id);
      if (t) { setEditTarget(t); setForm({ title: t.title, description: t.description, priority: t.priority, customer: t.customer, status: t.status }); }
    }
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    updateTicket(editTarget.id, form);
    setEditTarget(null);
  };

  const handleResolve = () => {
    if (!resolveTarget) return;
    resolveTicket(resolveTarget.id, resolveComment);
    setResolveTarget(null);
    setResolveComment('');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTicket(deleteTarget.id);
    setDeleteTarget(null);
  };

  const pageTitle  = isSupport ? 'Support Queue' : 'My Support Tickets';
  const pageSubtitle = isSupport
    ? `${openCount} open · ${inProgCount} in progress · ${resolvedCount} resolved`
    : `${visibleTickets.filter(t => t.status !== 'resolved').length} active tickets`;

  return (
    <div className="page-enter">
      <PageHeader title={pageTitle} subtitle={pageSubtitle}>
        <button className="btn-primary" onClick={() => { setForm({ title: '', description: '', priority: 'medium', customer: '' }); setShowAdd(true); }}>
          <Plus size={15} /> Raise a Ticket
        </button>
      </PageHeader>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: isSupport ? 'Open Tickets' : 'My Open',     value: isSupport ? openCount   : visibleTickets.filter(t=>t.status==='open').length,        color: '#EF4444', icon: AlertCircle },
          { label: isSupport ? 'In Progress'  : 'In Progress', value: isSupport ? inProgCount : visibleTickets.filter(t=>t.status==='in-progress').length,   color: '#F59E0B', icon: Clock },
          { label: isSupport ? 'Resolved'     : 'Resolved',    value: isSupport ? resolvedCount: visibleTickets.filter(t=>t.status==='resolved').length,     color: '#10B981', icon: CheckCircle2 },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: `${kpi.color}15`, color: kpi.color }}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>{kpi.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Status filter pills */}
        <div className="flex bg-secondary p-1 rounded-xl border border-primary overflow-hidden shrink-0">
          {['all', 'open', 'in-progress', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-700 capitalize transition-colors whitespace-nowrap"
              style={{
                background: filterStatus === f ? 'var(--bg-card)' : 'transparent',
                color: filterStatus === f
                  ? (f==='open'?'#EF4444':f==='resolved'?'#10B981':f==='in-progress'?'#F59E0B':'var(--text-primary)')
                  : 'var(--text-muted)',
                boxShadow: filterStatus === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}>
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
        {/* Priority filter */}
        <select className="select-field shrink-0" style={{ width: 130 }}
          value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
        </select>
      </div>

      {/* ── Ticket list ── */}
      {visibleTickets.length === 0 ? (
        <EmptyState icon={Ticket}
          title={isSupport ? 'No tickets in queue' : 'No tickets raised'}
          description={isSupport ? 'All issues have been resolved 🎉' : 'Click "Raise a Ticket" to report an issue.'}
          action={!isSupport && <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Raise a Ticket</button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visibleTickets.map(t => (
            <TicketCard
              key={t.id}
              t={t}
              isSupport={isSupport}
              users={users}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onResolve={t => { setResolveTarget(t); setResolveComment(''); }}
            />
          ))}
        </div>
      )}

      {/* ── Raise / Edit ticket modal ── */}
      <Modal
        isOpen={showAdd || !!editTarget}
        onClose={() => { setShowAdd(false); setEditTarget(null); }}
        title={editTarget ? 'Edit Ticket' : 'Raise a Support Ticket'}
        width={520}>
        <div className="flex flex-col gap-4">
          <FormGroup label="Issue Title" required>
            <input className="input-field" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Cannot export data to CSV" />
          </FormGroup>
          <FormGroup label="Description">
            <textarea className="input-field min-h-[90px] resize-y" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what's happening and any steps to reproduce..." />
          </FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Customer / Client">
              <input className="input-field" value={form.customer}
                onChange={e => setForm({ ...form, customer: e.target.value })}
                placeholder="Client name (optional)" />
            </FormGroup>
            <FormGroup label="Priority">
              <select className="select-field" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </FormGroup>
          </div>
          {/* Support can update status directly in edit modal */}
          {editTarget && isSupport && (
            <FormGroup label="Status">
              <select className="select-field" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
            </FormGroup>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => { setShowAdd(false); setEditTarget(null); }}>Cancel</button>
          <button className="btn-primary" onClick={editTarget ? handleEditSave : handleAdd}>
            {editTarget ? 'Save Changes' : 'Submit Ticket'}
          </button>
        </div>
      </Modal>

      {/* ── Resolve modal (Support only) ── */}
      <Modal isOpen={!!resolveTarget} onClose={() => setResolveTarget(null)} title="Resolve Ticket" width={480}>
        {resolveTarget && (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
              <p className="font-700 text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{resolveTarget.title}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {resolveTarget.customer} · {resolveTarget.created}
              </p>
            </div>
            <FormGroup label="Resolution Note (visible to ticket raiser)">
              <textarea className="input-field min-h-[100px] resize-y" value={resolveComment}
                onChange={e => setResolveComment(e.target.value)}
                placeholder="Explain what was done to resolve this issue..." />
            </FormGroup>
          </div>
        )}
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setResolveTarget(null)}>Cancel</button>
          <button onClick={handleResolve}
            className="px-5 py-2 rounded-xl text-sm font-700 flex items-center gap-2 transition-colors"
            style={{ background: '#10B981', color: 'white' }}>
            <CheckCircle2 size={15} /> Mark Resolved
          </button>
        </div>
      </Modal>

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Ticket"
        message={`Delete ticket "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
