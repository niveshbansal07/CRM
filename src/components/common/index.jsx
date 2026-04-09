import React from 'react';
import { X } from 'lucide-react';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, accentColor = '#0EA5E9', trend, trendLabel }) {
  return (
    <div className="card card-hover stat-card p-5" style={{ '--accent-color': accentColor }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-700 uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}18` }}>
          {Icon && <Icon size={17} style={{ color: accentColor }} />}
        </div>
      </div>
      <p className="text-3xl font-display font-700 mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
        {value}
      </p>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className="text-xs font-700 px-2 py-0.5 rounded-full"
            style={{
              background: trend >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: trend >= 0 ? '#10B981' : '#EF4444',
            }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        {subtitle && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        {trendLabel && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{trendLabel}</p>}
      </div>
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  active:      { bg: 'rgba(16,185,129,0.12)',  text: '#10B981' },
  inactive:    { bg: 'rgba(100,116,139,0.12)', text: '#64748B' },
  suspended:   { bg: 'rgba(239,68,68,0.12)',   text: '#EF4444' },
  new:         { bg: 'rgba(14,165,233,0.12)',  text: '#0EA5E9' },
  contacted:   { bg: 'rgba(99,102,241,0.12)',  text: '#6366F1' },
  qualified:   { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B' },
  proposal:    { bg: 'rgba(168,85,247,0.12)',  text: '#A855F7' },
  lost:        { bg: 'rgba(239,68,68,0.12)',   text: '#EF4444' },
  won:         { bg: 'rgba(16,185,129,0.12)',  text: '#10B981' },
  free:        { bg: 'rgba(100,116,139,0.12)', text: '#94A3B8' },
  pro:         { bg: 'rgba(14,165,233,0.12)',  text: '#0EA5E9' },
  enterprise:  { bg: 'rgba(168,85,247,0.12)',  text: '#A855F7' },
  high:        { bg: 'rgba(239,68,68,0.12)',   text: '#EF4444' },
  medium:      { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B' },
  low:         { bg: 'rgba(100,116,139,0.12)', text: '#64748B' },
  pending:     { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B' },
  completed:   { bg: 'rgba(16,185,129,0.12)',  text: '#10B981' },
  paid:        { bg: 'rgba(16,185,129,0.12)',  text: '#10B981' },
  overdue:     { bg: 'rgba(239,68,68,0.12)',   text: '#EF4444' },
  'closed won':{ bg: 'rgba(16,185,129,0.12)',  text: '#10B981' },
  'closed lost':{ bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
  discovery:   { bg: 'rgba(14,165,233,0.12)',  text: '#0EA5E9' },
  negotiation: { bg: 'rgba(168,85,247,0.12)',  text: '#A855F7' },
  sales:       { bg: 'rgba(245,158,11,0.12)',  text: '#F59E0B' },
  manager:     { bg: 'rgba(14,165,233,0.12)',  text: '#0EA5E9' },
  support:     { bg: 'rgba(99,102,241,0.12)',  text: '#6366F1' },
  finance:     { bg: 'rgba(16,185,129,0.12)',  text: '#10B981' },
  company_admin: { bg: 'rgba(168,85,247,0.12)', text: '#A855F7' },
};

export function Badge({ value }) {
  if (!value) return null;
  const key = value.toLowerCase();
  const style = BADGE_STYLES[key] || { bg: 'rgba(100,116,139,0.12)', text: '#94A3B8' };
  return (
    <span className="badge" style={{ background: style.bg, color: style.text }}>
      {value}
    </span>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, width = 560 }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <h2 className="text-base font-700" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-700 tracking-wide" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.1)' }}>
          <Icon size={24} style={{ color: '#0EA5E9' }} />
        </div>
      )}
      <p className="text-lg font-700 mb-2" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)', maxWidth: 320 }}>{description}</p>
      {action}
    </div>
  );
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="px-6 py-5">
          <h3 className="text-base font-700 mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{message}</p>
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FORM GROUP ──────────────────────────────────────────────────────────────
export function FormGroup({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
