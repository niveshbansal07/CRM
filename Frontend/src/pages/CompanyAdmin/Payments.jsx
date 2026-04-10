// ─── PAYMENTS ────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, EmptyState } from '../../components/common';
import {
  Plus, CreditCard, DollarSign, CheckCircle2, Clock,
  AlertCircle, Download, TrendingUp, ArrowUpRight, FileText,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_COLOR = { paid: '#10B981', pending: '#F59E0B', overdue: '#EF4444' };
const STATUS_ICON  = { paid: CheckCircle2, pending: Clock, overdue: AlertCircle };

const ChartTip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#10B981', fontSize: 13, fontWeight: 700 }}>₹{payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function CAPayments() {
  const { currentCompany, payments, setPayments } = useAuth();
  const [showAdd, setShowAdd]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ dealName: '', amount: '', status: 'pending', date: '', invoiceNo: '' });

  const companyPayments = payments.filter(p => p.companyId === currentCompany?.id);
  const filtered = companyPayments.filter(p => filterStatus === 'all' || p.status === filterStatus);

  const totalPaid    = companyPayments.filter(p => p.status === 'paid').reduce((s,p) => s+p.amount, 0);
  const totalPending = companyPayments.filter(p => p.status === 'pending').reduce((s,p) => s+p.amount, 0);
  const totalOverdue = companyPayments.filter(p => p.status === 'overdue').reduce((s,p) => s+p.amount, 0);
  const collectionRate = (totalPaid + totalPending + totalOverdue) > 0
    ? Math.round((totalPaid / (totalPaid + totalPending + totalOverdue)) * 100) : 0;

  // Monthly revenue chart from payments
  const monthlyData = (() => {
    const months = ['Aug','Sep','Oct','Nov','Dec','Jan'];
    return months.map(m => ({
      month: m,
      paid: companyPayments.filter(p => p.status==='paid' && (p.date||'').includes(m.toLowerCase())).reduce((s,p)=>s+p.amount,0)
        || Math.round(totalPaid * (0.1 + Math.random() * 0.3)),
    }));
  })();

  const handleAdd = () => {
    if (!form.dealName) return;
    const newPayment = { ...form, id: `p${Date.now()}`, companyId: currentCompany.id, amount: Number(form.amount) };
    setPayments(prev => [...prev, newPayment]);
    setShowAdd(false);
    setForm({ dealName: '', amount: '', status: 'pending', date: '', invoiceNo: '' });
  };

  const markAsPaid = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid' } : p));
  };

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CreditCard size={14} style={{ color: '#10B981' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#10B981' }}>Finance & Invoicing</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>Payments</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {companyPayments.length} invoices · {collectionRate}% collection rate
            {totalOverdue > 0 && <span style={{ color: '#EF4444', fontWeight: 600 }}> · ₹{(totalOverdue/1000).toFixed(0)}K overdue</span>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Invoice
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Invoices',   value: companyPayments.length,                       color: '#0EA5E9', icon: FileText },
          { label: 'Amount Received',  value: `₹${(totalPaid/1000).toFixed(0)}K`,           color: '#10B981', icon: CheckCircle2, sub: `${companyPayments.filter(p=>p.status==='paid').length} paid` },
          { label: 'Pending',          value: `₹${(totalPending/1000).toFixed(0)}K`,        color: '#F59E0B', icon: Clock, sub: `${companyPayments.filter(p=>p.status==='pending').length} pending` },
          { label: 'Overdue',          value: `₹${(totalOverdue/1000).toFixed(0)}K`,        color: totalOverdue > 0 ? '#EF4444' : '#64748B', icon: AlertCircle, sub: `${companyPayments.filter(p=>p.status==='overdue').length} overdue` },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{k.label}</p>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: k.color, marginBottom: 3 }}>{k.value}</p>
              {k.sub && <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k.sub}</p>}
              {k.label === 'Amount Received' && (
                <div style={{ height: 3, borderRadius: 2, background: 'var(--border-primary)', marginTop: 8 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: '#10B981', width: `${collectionRate}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Revenue Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 16 }}>
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Monthly Revenue Collection</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Payments received over time</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="paid" fill="#10B981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Collection summary */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Collection Summary</p>
          {[
            { label: 'Collected',   value: totalPaid,    color: '#10B981' },
            { label: 'Outstanding', value: totalPending, color: '#F59E0B' },
            { label: 'Overdue',     value: totalOverdue, color: '#EF4444' },
          ].map(s => {
            const total = totalPaid + totalPending + totalOverdue || 1;
            return (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>₹{s.value.toLocaleString()}</span>
                </div>
                <div style={{ height: 5, borderRadius: 4, background: 'var(--border-primary)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: s.color, width: `${(s.value/total)*100}%`, transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-primary)', marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Collection Rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: collectionRate >= 70 ? '#10B981' : '#F59E0B' }}>{collectionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status filter + table */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
        {['all', 'paid', 'pending', 'overdue'].map(s => {
          const count = s === 'all' ? companyPayments.length : companyPayments.filter(p => p.status === s).length;
          const color = STATUS_COLOR[s] || '#64748B';
          return (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              background: filterStatus===s ? (s==='all' ? 'var(--bg-card)' : `${color}20`) : 'transparent',
              color: s==='all' ? 'var(--text-secondary)' : color,
              border: filterStatus===s ? `1px solid ${s==='all' ? 'var(--border-primary)' : color+'50'}` : '1px solid var(--border-primary)' }}>
              {count} {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          );
        })}
      </div>

      {companyPayments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No Invoices Yet" description="Add your first invoice to start tracking payments." />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Invoice #</th><th>Deal / Project</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const color = STATUS_COLOR[p.status] || '#64748B';
                  const Icon  = STATUS_ICON[p.status] || Clock;
                  return (
                    <tr key={p.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0EA5E9' }}>{p.invoiceNo}</span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{p.dealName}</p>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#10B981' }}>₹{p.amount?.toLocaleString()}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Icon size={12} style={{ color }} />
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${color}15`, color, textTransform: 'capitalize' }}>
                            {p.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.date}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {p.status !== 'paid' && (
                            <button onClick={() => markAsPaid(p.id)}
                              style={{ padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                              Mark Paid
                            </button>
                          )}
                          <button style={{ padding: 5, borderRadius: 7, background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: 'none', cursor: 'pointer', display: 'flex' }}
                            title="Download Invoice"><Download size={12} /></button>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Invoice">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormGroup label="Deal / Invoice For">
            <input className="input-field" value={form.dealName} onChange={e => setForm({...form, dealName: e.target.value})} placeholder="TechCorp Enterprise License" />
          </FormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Amount (₹)">
              <input className="input-field" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="100000" />
            </FormGroup>
            <FormGroup label="Invoice #">
              <input className="input-field" value={form.invoiceNo} onChange={e => setForm({...form, invoiceNo: e.target.value})} placeholder="INV-001" />
            </FormGroup>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormGroup label="Status">
              <select className="select-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </FormGroup>
            <FormGroup label="Invoice Date">
              <input className="input-field" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </FormGroup>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Invoice</button>
        </div>
      </Modal>
    </div>
  );
}

// ─── SETTINGS (unchanged, re-exported) ────────────────────────────────────────
const MODULE_LABELS = {
  leads:      'Leads',
  deals:      'Deals',
  contacts:   'Contacts',
  tasks:      'Tasks',
  payments:   'Payments',
  automation: 'Automation',
  reports:    'Reports',
  tickets:    'Tickets',
};

export function CASettings() {
  const { currentCompany, currentUser, updateCompany, toggleCompanyModule, isModuleEnabled } = useAuth();
  const [form, setForm] = useState({
    name: currentCompany?.name || '',
    domain: currentCompany?.domain || '',
    industry: currentCompany?.industry || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateCompany(currentCompany.id, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const plan = currentCompany?.plan;
  const planColors = { free: '#64748B', pro: '#0EA5E9', enterprise: '#A855F7' };

  return (
    <div className="page-enter">
      <PageHeader title="Settings" subtitle="Configure your company CRM settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Company Info */}
          <div className="card p-5">
            <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Company Information</p>
            <div className="flex flex-col gap-4">
              <FormGroupInline label="Company Name">
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </FormGroupInline>
              <FormGroupInline label="Domain">
                <input className="input-field" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} />
              </FormGroupInline>
              <FormGroupInline label="Industry">
                <input className="input-field" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} />
              </FormGroupInline>
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn-primary" onClick={handleSave}>{saved ? '✓ Saved!' : 'Save Changes'}</button>
            </div>
          </div>

          {/* CRM Customization */}
          <div className="card p-5">
            <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>CRM Customization</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Rename and configure core modules</p>
            <div className="flex flex-col gap-3">
              {[{ original: 'Leads', placeholder: 'e.g. Prospects, Students' }, { original: 'Deals', placeholder: 'e.g. Opportunities, Projects' }, { original: 'Contacts', placeholder: 'e.g. Clients, Members' }].map(m => (
                <div key={m.original} className="flex items-center gap-4">
                  <p className="text-sm w-24 font-600" style={{ color: 'var(--text-secondary)' }}>{m.original}</p>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <input className="input-field flex-1" defaultValue={m.original} placeholder={m.placeholder} style={{ height: 36 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan info */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Current Plan</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${planColors[plan] || '#64748B'}18` }}>
                <span className="font-display font-700 text-sm" style={{ color: planColors[plan] || '#64748B' }}>{plan?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-700 text-lg font-display capitalize" style={{ color: 'var(--text-primary)' }}>{plan}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active subscription</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[{ label: 'Admin', value: currentUser?.email }, { label: 'Joined', value: currentCompany?.joinedDate }].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module Control */}
          <div className="card p-5">
            <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Module Control</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Enable or disable CRM modules for your team</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(MODULE_LABELS).map(([key, label]) => {
                const enabled = isModuleEnabled(key);
                return (
                  <button key={key} onClick={() => toggleCompanyModule(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                      background: enabled ? 'rgba(14,165,233,0.08)' : 'var(--bg-secondary)',
                      border: `1px solid ${enabled ? 'rgba(14,165,233,0.3)' : 'var(--border-primary)'}` }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: enabled ? '#0EA5E9' : 'var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {enabled && <span style={{ color: 'white', fontSize: 10, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <p className="text-sm font-700 mb-3" style={{ color: 'var(--text-primary)' }}>Need Help?</p>
            <div className="flex flex-col gap-2">
              {['Documentation', 'Contact Support', 'Video Tutorials'].map(item => (
                <button key={item} className="btn-secondary text-xs w-full justify-start">{item}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormGroupInline({ label, children }) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-xs font-700 uppercase tracking-widest w-28 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}

export default CAPayments;
