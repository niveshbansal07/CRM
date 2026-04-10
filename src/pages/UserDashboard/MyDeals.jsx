import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Modal, FormGroup, EmptyState } from '../../components/common';
import { TrendingUp, LayoutGrid, List, Search } from 'lucide-react';

const STAGES = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const STAGE_COLORS = {
  'Discovery':'#0EA5E9', 'Qualified':'#6366F1', 'Proposal':'#F59E0B',
  'Negotiation':'#A855F7', 'Closed Won':'#10B981', 'Closed Lost':'#EF4444'
};

export default function UMyDeals() {
  const { currentUser, currentCompany, deals, updateDeal, hasPermission } = useAuth();

  const [viewMode, setViewMode] = useState('kanban');
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});

  const myDeals = useMemo(() =>
    deals.filter(d => d.assignedTo === currentUser?.id || d.companyId === currentCompany?.id),
    [deals, currentUser, currentCompany]
  );

  const filteredDeals = useMemo(() =>
    myDeals.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.contact.toLowerCase().includes(search.toLowerCase())
    ), [myDeals, search]
  );

  const totalValue = myDeals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage)).reduce((a,d) => a + (d.value||0), 0);
  const wonValue   = myDeals.filter(d => d.stage === 'Closed Won').reduce((a,d) => a + (d.value||0), 0);

  const handleUpdate = () => { updateDeal(editTarget.id, form); setEditTarget(null); };

  function KanbanCard({ d }) {
    const color = STAGE_COLORS[d.stage] || '#64748B';
    return (
      <div onClick={() => { if (hasPermission('deals','edit')) { setEditTarget(d); setForm({...d}); }}}
           className="rounded-xl p-3 mb-3 cursor-pointer transition-all"
           style={{
             background: 'var(--bg-card)',
             border: '1px solid var(--border-primary)',
             boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
           }}
           onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
           onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}>
        <div className="flex items-start justify-between mb-2">
          <p className="font-700 text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{d.contact}</p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-700" style={{ color: '#10B981' }}>₹{d.value?.toLocaleString()}</span>
          <div className="px-2 py-0.5 rounded text-[10px] font-700"
               style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
            {d.probability}% WIN
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden"
             style={{ background: 'var(--border-primary)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${d.probability}%`, background: color }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader title="My Deals" subtitle={`${myDeals.length} active deals in pipeline`}>
        <div className="flex items-center gap-2">
          <div className="bg-secondary rounded-lg border border-primary p-0.5 flex">
            <button onClick={() => setViewMode('kanban')} className="p-1.5 rounded transition-colors"
              style={{ background: viewMode==='kanban'?'var(--bg-card)':'transparent', color: viewMode==='kanban'?'var(--text-primary)':'var(--text-muted)' }}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setViewMode('list')} className="p-1.5 rounded transition-colors"
              style={{ background: viewMode==='list'?'var(--bg-card)':'transparent', color: viewMode==='list'?'var(--text-primary)':'var(--text-muted)' }}>
              <List size={15} />
            </button>
          </div>
        </div>
      </PageHeader>

      {/* KPIs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-4">
          <div className="bg-card border border-primary rounded-xl px-4 py-2 flex flex-col">
            <span className="text-xs text-muted font-700 uppercase">Pipeline Value</span>
            <span className="font-700 text-indigo-400">₹{totalValue.toLocaleString()}</span>
          </div>
          <div className="bg-card border border-primary rounded-xl px-4 py-2 flex flex-col">
            <span className="text-xs text-muted font-700 uppercase">Revenue Won</span>
            <span className="font-700 text-emerald-400">₹{wonValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input-field pl-9" placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No Deals Found" description="Try adjusting your search query." />
      ) : viewMode === 'kanban' ? (
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x" style={{ minHeight: 'calc(100vh - 280px)' }}>
          {STAGES.map(stage => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage);
            const color = STAGE_COLORS[stage];
            return (
              <div key={stage} className="rounded-xl p-3 flex-shrink-0 snap-start flex flex-col"
                   style={{ width: 300, background: 'var(--bg-secondary)', borderTop: `3px solid ${color}`, borderLeft: '1px solid var(--border-primary)', borderRight: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', borderRadius: 12 }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-700 text-sm uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{stage}</h3>
                  <span className="text-xs font-700 px-2 py-0.5 rounded-full"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                    {stageDeals.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto pr-1">
                  {stageDeals.map(d => <KanbanCard key={d.id} d={d} />)}
                  {stageDeals.length === 0 && (
                    <div className="h-24 rounded-xl flex items-center justify-center text-xs font-600"
                         style={{ border: '2px dashed var(--border-primary)', color: 'var(--text-muted)' }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left border-collapse">
              <thead><tr><th>Deal Name</th><th>Contact</th><th>Stage</th><th>Value</th><th>Close Date</th></tr></thead>
              <tbody>
                {filteredDeals.map(d => (
                  <tr key={d.id} onClick={() => { if(hasPermission('deals','edit')){ setEditTarget(d); setForm({...d}); }}} className="cursor-pointer hover:bg-hover transition-colors">
                    <td className="font-700 text-primary">{d.name}</td>
                    <td className="text-secondary">{d.contact}</td>
                    <td><span className="text-xs px-2 py-1 rounded-full font-700" style={{ background: `${STAGE_COLORS[d.stage]}15`, color: STAGE_COLORS[d.stage] }}>{d.stage}</span></td>
                    <td className="font-mono text-emerald-500 font-700">₹{d.value?.toLocaleString()}</td>
                    <td className="text-secondary text-sm">{d.expectedClose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Update Deal Status" width={400}>
        <div className="flex flex-col gap-4">
          <FormGroup label="Pipeline Stage">
            <select className="select-field" value={form.stage || ''} onChange={e => setForm({...form, stage: e.target.value})}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Probability (%)">
            <div className="flex items-center gap-3">
              <input type="range" className="flex-1" min="0" max="100" step="10" value={form.probability || 0} onChange={e => setForm({...form, probability: Number(e.target.value)})} />
              <span className="font-mono text-sm font-700 w-10 text-right text-primary">{form.probability}%</span>
            </div>
          </FormGroup>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleUpdate}>Save Changes</button>
        </div>
      </Modal>
    </div>
  );
}
