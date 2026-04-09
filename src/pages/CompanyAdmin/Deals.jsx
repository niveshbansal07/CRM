import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { PIPELINE_STAGES } from '../../data/mockData';
import { Plus, Layers, Edit2, Trash2, DollarSign, TrendingUp, Target } from 'lucide-react';

export default function CADeals() {
  const { currentCompany, deals, users, addDeal, updateDeal, deleteDeal } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('pipeline');

  const defaultForm = { name: '', contact: '', value: '', stage: 'Discovery', probability: 25, assignedTo: '', expectedClose: '' };
  const [form, setForm] = useState(defaultForm);

  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id && ['sales','manager'].includes(u.role));

  const totalValue = companyDeals.reduce((s, d) => s + (d.value || 0), 0);
  const wonValue = companyDeals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + (d.value || 0), 0);
  const weightedValue = companyDeals.reduce((s, d) => s + ((d.value || 0) * (d.probability || 0) / 100), 0);

  const stageColors = {
    'Discovery':    '#0EA5E9',
    'Qualified':    '#6366F1',
    'Proposal':     '#F59E0B',
    'Negotiation':  '#A855F7',
    'Closed Won':   '#10B981',
    'Closed Lost':  '#EF4444',
  };

  const getUserName = (id) => users.find(u => u.id === id)?.name || '—';

  const handleAdd = () => {
    if (!form.name) return;
    addDeal({ ...form, companyId: currentCompany.id, value: Number(form.value) || 0, probability: Number(form.probability) || 0 });
    setShowAdd(false);
    setForm(defaultForm);
  };

  const handleEdit = () => {
    updateDeal(editTarget.id, { ...form, value: Number(form.value), probability: Number(form.probability) });
    setEditTarget(null);
  };

  const openEdit = (d) => { setEditTarget(d); setForm({ ...d }); };

  const DealForm = () => (
    <div className="flex flex-col gap-4">
      <FormGroup label="Deal Name" required>
        <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enterprise License Deal" />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Contact Person">
          <input className="input-field" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="Decision Maker Name" />
        </FormGroup>
        <FormGroup label="Deal Value (₹)">
          <input className="input-field" type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="100000" />
        </FormGroup>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormGroup label="Stage">
          <select className="select-field" value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
            {PIPELINE_STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Probability (%)">
          <input className="input-field" type="number" min="0" max="100" value={form.probability} onChange={e => setForm({...form, probability: e.target.value})} />
        </FormGroup>
        <FormGroup label="Expected Close">
          <input className="input-field" type="date" value={form.expectedClose} onChange={e => setForm({...form, expectedClose: e.target.value})} />
        </FormGroup>
      </div>
      <FormGroup label="Assigned To">
        <select className="select-field" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
          <option value="">Unassigned</option>
          {companyUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </FormGroup>
    </div>
  );

  // Pipeline view
  const PipelineView = () => (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_STAGES.map(stage => {
          const stageDeals = companyDeals.filter(d => d.stage === stage);
          const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
          const color = stageColors[stage] || '#64748B';
          return (
            <div key={stage} className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
                style={{ background: `${color}12`, border: `1px solid ${color}25`, borderBottom: 'none' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }}></div>
                  <span className="text-xs font-700 uppercase tracking-wider" style={{ color }}>{stage}</span>
                </div>
                <span className="text-xs font-700" style={{ color }}>
                  {stageDeals.length} · ₹{(stageTotal/1000).toFixed(0)}K
                </span>
              </div>
              <div className="rounded-b-xl min-h-32 p-2 flex flex-col gap-2"
                style={{ background: 'var(--bg-secondary)', border: `1px solid ${color}20`, borderTop: 'none' }}>
                {stageDeals.map(deal => (
                  <div key={deal.id} className="pipeline-card group">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-700 leading-tight" style={{ color: 'var(--text-primary)', flex: 1, paddingRight: 8 }}>{deal.name}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(deal)} className="p-0.5" style={{ color: 'var(--text-muted)' }}>
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => setDeleteTarget(deal)} className="p-0.5" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{deal.contact}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-700" style={{ color: '#10B981' }}>
                        ₹{(deal.value||0).toLocaleString()}
                      </span>
                      <span className="text-xs font-600 px-2 py-0.5 rounded-full"
                        style={{ background: `${color}15`, color }}>
                        {deal.probability}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="h-1 rounded-full" style={{ background: 'var(--border-primary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${deal.probability}%`, background: color }}></div>
                      </div>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      {getUserName(deal.assignedTo)} · Close: {deal.expectedClose}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="Deals Pipeline" subtitle={`${companyDeals.length} active deals`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Deal</button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Pipeline', value: `₹${(totalValue/1000).toFixed(0)}K`, color: '#0EA5E9', icon: DollarSign },
          { label: 'Won Value', value: `₹${(wonValue/1000).toFixed(0)}K`, color: '#10B981', icon: TrendingUp },
          { label: 'Weighted Value', value: `₹${(weightedValue/1000).toFixed(0)}K`, color: '#A855F7', icon: Target },
          { label: 'Win Rate', value: `${companyDeals.length ? Math.round((companyDeals.filter(d=>d.stage==='Closed Won').length/companyDeals.length)*100) : 0}%`, color: '#F59E0B', icon: Layers },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}18` }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-700 text-lg font-display" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        {['pipeline', 'table'].map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className="px-4 py-1.5 rounded-lg text-xs font-600 capitalize transition-all"
            style={{
              background: viewMode === m ? 'var(--bg-card)' : 'transparent',
              color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>
            {m === 'pipeline' ? 'Pipeline View' : 'Table View'}
          </button>
        ))}
      </div>

      {companyDeals.length === 0 ? (
        <EmptyState icon={Layers} title="No Deals Yet" description="Create your first deal to start tracking your pipeline." action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Deal</button>} />
      ) : viewMode === 'pipeline' ? (
        <PipelineView />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Deal Name</th><th>Contact</th><th>Stage</th><th>Value</th><th>Probability</th><th>Assigned</th><th>Expected Close</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {companyDeals.map(d => (
                  <tr key={d.id}>
                    <td><p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</p></td>
                    <td style={{ fontSize: 12 }}>{d.contact}</td>
                    <td><Badge value={d.stage.toLowerCase()} /></td>
                    <td><span className="font-mono text-xs font-600" style={{ color: '#10B981' }}>₹{d.value?.toLocaleString()}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-primary)', width: 60 }}>
                          <div className="h-full rounded-full" style={{ width: `${d.probability}%`, background: stageColors[d.stage] }}></div>
                        </div>
                        <span className="text-xs font-600" style={{ color: stageColors[d.stage] }}>{d.probability}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{getUserName(d.assignedTo)}</td>
                    <td style={{ fontSize: 12 }}>{d.expectedClose}</td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Deal">
        <DealForm />
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn-primary" onClick={handleAdd}>Add Deal</button></div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Deal">
        <DealForm />
        <div className="flex gap-3 justify-end mt-5"><button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button><button className="btn-primary" onClick={handleEdit}>Save</button></div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteDeal(deleteTarget?.id)} title="Delete Deal" message={`Delete deal "${deleteTarget?.name}"?`} />
    </div>
  );
}
