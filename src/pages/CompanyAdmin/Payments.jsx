// ─── PAYMENTS ────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, EmptyState } from '../../components/common';
import { Plus, CreditCard, DollarSign, CheckCircle, Clock } from 'lucide-react';

export function CAPayments() {
  const { currentCompany, payments, setPayments } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ dealName: '', amount: '', status: 'pending', date: '', invoiceNo: '' });

  const companyPayments = payments.filter(p => p.companyId === currentCompany?.id);
  const totalPaid = companyPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = companyPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const handleAdd = () => {
    if (!form.dealName) return;
    const newPayment = { ...form, id: `p${Date.now()}`, companyId: currentCompany.id, amount: Number(form.amount) };
    setPayments(prev => [...prev, newPayment]);
    setShowAdd(false);
    setForm({ dealName: '', amount: '', status: 'pending', date: '', invoiceNo: '' });
  };

  return (
    <div className="page-enter">
      <PageHeader title="Payments" subtitle="Track invoices and payment status">
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Invoice</button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Invoices', value: companyPayments.length, color: '#0EA5E9', icon: CreditCard },
          { label: 'Amount Received', value: `₹${totalPaid.toLocaleString()}`, color: '#10B981', icon: CheckCircle },
          { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, color: '#F59E0B', icon: Clock },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {companyPayments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No Payments Yet" description="Add your first invoice to start tracking payments." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Deal</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {companyPayments.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-mono text-xs" style={{ color: '#0EA5E9' }}>{p.invoiceNo}</span></td>
                    <td><p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{p.dealName}</p></td>
                    <td><span className="font-mono text-sm font-700" style={{ color: '#10B981' }}>₹{p.amount?.toLocaleString()}</span></td>
                    <td><Badge value={p.status} /></td>
                    <td style={{ fontSize: 12 }}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Invoice">
        <div className="flex flex-col gap-4">
          <FormGroup label="Deal / Invoice For"><input className="input-field" value={form.dealName} onChange={e => setForm({...form, dealName: e.target.value})} placeholder="Project Name" /></FormGroup>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Amount (₹)"><input className="input-field" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></FormGroup>
            <FormGroup label="Invoice #"><input className="input-field" value={form.invoiceNo} onChange={e => setForm({...form, invoiceNo: e.target.value})} placeholder="INV-001" /></FormGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormGroup label="Status"><select className="select-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select></FormGroup>
            <FormGroup label="Date"><input className="input-field" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></FormGroup>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Add Invoice</button></div>
      </Modal>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export function CASettings() {
  const { currentCompany, currentUser, updateCompany } = useAuth();
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
              <button className="btn-primary" onClick={handleSave}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* CRM Customization */}
          <div className="card p-5">
            <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>CRM Customization</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Rename and configure core modules</p>
            <div className="flex flex-col gap-3">
              {[
                { original: 'Leads', custom: 'Leads', placeholder: 'e.g. Prospects, Students' },
                { original: 'Deals', custom: 'Deals', placeholder: 'e.g. Opportunities, Projects' },
                { original: 'Contacts', custom: 'Contacts', placeholder: 'e.g. Clients, Members' },
              ].map(m => (
                <div key={m.original} className="flex items-center gap-4">
                  <p className="text-sm w-24 font-600" style={{ color: 'var(--text-secondary)' }}>{m.original}</p>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <input className="input-field flex-1" defaultValue={m.custom} placeholder={m.placeholder} style={{ height: 36 }} />
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${planColors[plan] || '#64748B'}18` }}>
                <span className="font-display font-700 text-sm" style={{ color: planColors[plan] || '#64748B' }}>
                  {plan?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-700 text-lg font-display capitalize" style={{ color: 'var(--text-primary)' }}>{plan}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Active subscription</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Admin', value: currentUser?.email },
                { label: 'Users', value: `${currentCompany?.users} active` },
                { label: 'Leads', value: currentCompany?.leads?.toLocaleString() },
                { label: 'Joined', value: currentCompany?.joinedDate },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                  <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{r.value}</span>
                </div>
              ))}
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
