import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { PIPELINE_STAGES } from '../../data/mockData';
import {
  Plus, Layers, Edit2, Trash2, DollarSign, TrendingUp,
  Target, BarChart2, Clock, User, ArrowUpRight, TrendingDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STAGE_COLOR = {
  'Discovery':   '#0EA5E9',
  'Qualified':   '#6366F1',
  'Proposal':    '#F59E0B',
  'Negotiation': '#A855F7',
  'Closed Won':  '#10B981',
  'Closed Lost': '#EF4444',
};

const ChartTip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: payload[0]?.fill || '#0EA5E9', fontSize: 13, fontWeight: 700 }}>
          ₹{((payload[0]?.value || 0) / 1000).toFixed(0)}K · {payload[1]?.value || 0} deals
        </p>
      </div>
    );
  }
  return null;
};

export default function CADeals() {
  const { currentCompany, deals, users, addDeal, updateDeal, deleteDeal } = useAuth();
  const [showAdd, setShowAdd]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode]       = useState('pipeline');
  const [filterStage, setFilterStage] = useState('all');

  const defaultForm = { name: '', contact: '', value: '', stage: 'Discovery', probability: 25, assignedTo: '', expectedClose: '' };
  const [form, setForm] = useState(defaultForm);

  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id && ['sales','manager'].includes(u.role));

  const totalPipeline  = companyDeals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage)).reduce((s,d) => s+(d.value||0), 0);
  const wonValue       = companyDeals.filter(d => d.stage === 'Closed Won').reduce((s,d) => s+(d.value||0), 0);
  const weightedValue  = companyDeals.reduce((s,d) => s+((d.value||0)*(d.probability||0)/100), 0);
  const lostValue      = companyDeals.filter(d => d.stage === 'Closed Lost').reduce((s,d) => s+(d.value||0), 0);
  const winRate        = companyDeals.length ? Math.round((companyDeals.filter(d=>d.stage==='Closed Won').length / companyDeals.length)*100) : 0;
  const avgDealSize    = companyDeals.length ? Math.round(companyDeals.reduce((s,d) => s+(d.value||0), 0) / companyDeals.length) : 0;

  // Forecast chart data per stage
  const forecastData = ['Discovery','Qualified','Proposal','Negotiation'].map(stage => ({
    stage: stage.substring(0, 4),
    value: companyDeals.filter(d => d.stage === stage).reduce((s,d) => s+(d.value||0),0),
    count: companyDeals.filter(d => d.stage === stage).length,
    color: STAGE_COLOR[stage],
  }));

  const getUserName = (id) => users.find(u => u.id === id)?.name || '—';

  const handleAdd = () => {
    if (!form.name) return;
    addDeal({ ...form, companyId: currentCompany.id, value: Number(form.value)||0, probability: Number(form.probability)||0 });
    setShowAdd(false); setForm(defaultForm);
  };
  const handleEdit = () => {
    updateDeal(editTarget.id, { ...form, value: Number(form.value), probability: Number(form.probability) });
    setEditTarget(null);
  };
  const openEdit = (d) => { setEditTarget(d); setForm({ ...d }); };

  const DealForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FormGroup label="Deal Name" required>
        <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Enterprise License Deal" />
      </FormGroup>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FormGroup label="Contact Person">
          <input className="input-field" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="Decision Maker Name" />
        </FormGroup>
        <FormGroup label="Deal Value (₹)">
          <input className="input-field" type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="100000" />
        </FormGroup>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
      {/* Probability visual */}
      <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Win Probability</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: Number(form.probability) >= 70 ? '#10B981' : Number(form.probability) >= 40 ? '#F59E0B' : '#EF4444' }}>{form.probability}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 4, background: 'var(--border-primary)' }}>
          <div style={{ height: '100%', borderRadius: 4, background: Number(form.probability) >= 70 ? '#10B981' : Number(form.probability) >= 40 ? '#F59E0B' : '#EF4444', width: `${form.probability}%`, transition: 'width 0.2s' }} />
        </div>
      </div>
    </div>
  );

  const PipelineView = () => (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
        {PIPELINE_STAGES.map(stage => {
          const stageDeals = companyDeals.filter(d => d.stage === stage);
          const stageVal   = stageDeals.reduce((s,d) => s+(d.value||0), 0);
          const color      = STAGE_COLOR[stage];
          return (
            <div key={stage} style={{ width: 256, flexShrink: 0 }}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px',
                borderRadius: '12px 12px 0 0', background: `${color}12`, border: `1px solid ${color}25`, borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color }}>{stage}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color }}>{stageDeals.length}</div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--text-muted)' }}>₹{(stageVal/1000).toFixed(0)}K</div>
                </div>
              </div>
              {/* Cards */}
              <div style={{ minHeight: 128, padding: 8, background: 'var(--bg-secondary)',
                border: `1px solid ${color}20`, borderTop: 'none', borderRadius: '0 0 12px 12px',
                display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageDeals.map(deal => {
                  const probColor = deal.probability >= 70 ? '#10B981' : deal.probability >= 40 ? '#F59E0B' : '#EF4444';
                  const isOverdue = deal.expectedClose && new Date(deal.expectedClose) < new Date();
                  return (
                    <div key={deal.id} className="pipeline-card group" style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '12px 0 0 12px', background: color }} />
                      <div style={{ paddingLeft: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flex: 1, paddingRight: 4, lineHeight: 1.3 }}>{deal.name}</p>
                          <div style={{ display: 'flex', gap: 2, opacity: 0 }} className="group-hover:opacity-100" onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                            <button onClick={() => openEdit(deal)} style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                            <button onClick={() => setDeleteTarget(deal)} style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                          </div>
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 7 }}>{deal.contact}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#10B981' }}>₹{(deal.value||0).toLocaleString()}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: `${probColor}15`, color: probColor }}>{deal.probability}%</span>
                        </div>
                        {/* Probability bar */}
                        <div style={{ height: 3, borderRadius: 2, background: 'var(--border-primary)', marginBottom: 5 }}>
                          <div style={{ height: '100%', borderRadius: 2, background: probColor, width: `${deal.probability}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{getUserName(deal.assignedTo)}</span>
                          {deal.expectedClose && (
                            <span style={{ fontSize: 8, fontWeight: 700, color: isOverdue ? '#EF4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Clock size={8} /> {deal.expectedClose}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {stageDeals.length === 0 && (
                  <div style={{ padding: '20px 10px', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No deals</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="Deal Pipeline" subtitle={`${companyDeals.length} deals · ${winRate}% win rate`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Deal</button>
      </PageHeader>

      {/* 6-KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Active Pipeline', value: `₹${(totalPipeline/1000).toFixed(0)}K`, color: '#0EA5E9', icon: Layers, sub: `${companyDeals.filter(d=>!['Closed Won','Closed Lost'].includes(d.stage)).length} deals` },
          { label: 'Won Revenue',    value: `₹${(wonValue/1000).toFixed(0)}K`,     color: '#10B981', icon: TrendingUp, sub: `${companyDeals.filter(d=>d.stage==='Closed Won').length} closed` },
          { label: 'Weighted FCast', value: `₹${(weightedValue/1000).toFixed(0)}K`, color: '#A855F7', icon: BarChart2, sub: 'probability-adjusted' },
          { label: 'Lost Value',     value: `₹${(lostValue/1000).toFixed(0)}K`,    color: '#EF4444', icon: TrendingDown, sub: `${companyDeals.filter(d=>d.stage==='Closed Lost').length} lost` },
          { label: 'Win Rate',       value: `${winRate}%`,                          color: winRate >= 50 ? '#10B981' : '#F59E0B', icon: Target, sub: 'all time' },
          { label: 'Avg Deal Size',  value: `₹${(avgDealSize/1000).toFixed(0)}K`,  color: '#F59E0B', icon: DollarSign, sub: 'across deals' },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{k.label}</p>
                <Icon size={12} style={{ color: k.color }} />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: k.color, marginBottom: 2 }}>{k.value}</p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Forecast Chart + View Toggle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start', marginBottom: 14 }}>
        <div className="card p-4">
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Pipeline Forecast by Stage</p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 12 }}>Total deal value currently in each stage</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={forecastData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {forecastData.map((entry, i) => (
                  <rect key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {['pipeline', 'table'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
              background: viewMode === m ? 'var(--bg-card)' : 'transparent', color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              border: viewMode === m ? '1px solid var(--border-primary)' : '1px solid transparent' }}>
              {m === 'pipeline' ? '⚡ Pipeline' : '📋 Table'}
            </button>
          ))}
        </div>
      </div>

      {companyDeals.length === 0 ? (
        <EmptyState icon={Layers} title="No Deals Yet" description="Create your first deal to track your pipeline."
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Deal</button>} />
      ) : viewMode === 'pipeline' ? <PipelineView /> : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Deal Name</th><th>Contact</th><th>Stage</th><th>Value</th><th>Probability</th><th>Assigned</th><th>Close Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {companyDeals.map(d => {
                  const color = STAGE_COLOR[d.stage] || '#64748B';
                  const isOverdue = d.expectedClose && new Date(d.expectedClose) < new Date() && !['Closed Won','Closed Lost'].includes(d.stage);
                  return (
                    <tr key={d.id}>
                      <td><p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{d.name}</p></td>
                      <td style={{ fontSize: 12 }}>{d.contact}</td>
                      <td>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${color}15`, color }}>{d.stage}</span>
                      </td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10B981' }}>₹{(d.value||0).toLocaleString()}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 60, height: 5, borderRadius: 4, background: 'var(--border-primary)' }}>
                            <div style={{ height: '100%', borderRadius: 4, background: color, width: `${d.probability}%` }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color }}>{d.probability}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{getUserName(d.assignedTo)}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? '#EF4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isOverdue && <Clock size={11} />} {d.expectedClose || '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openEdit(d)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                          <button onClick={() => setDeleteTarget(d)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Deal">
        <DealForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Add Deal</button>
        </div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Deal">
        <DealForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteDeal(deleteTarget?.id)} title="Delete Deal" message={`Delete deal "${deleteTarget?.name}"?`} />
    </div>
  );
}
