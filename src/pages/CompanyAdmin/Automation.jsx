import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { Plus, Zap, Trash2, Play, Pause, Activity } from 'lucide-react';

const TRIGGERS = [
  'Lead Created', 'Lead Status Changed', 'Deal Created', 'Deal Stage Changed',
  'Deal Closed Won', 'Task Created', 'Task Overdue', 'No Contact 3 Days',
  'Payment Received', 'New User Added',
];

const ACTIONS = [
  'Send Email', 'Create Task', 'Assign to Sales Round Robin',
  'Send Slack Notification', 'Send Welcome Email', 'Send Email + Brochure',
  'Update Lead Status', 'Send SMS', 'Create Deal', 'Notify Manager',
];

export default function CAAutomation() {
  const { currentCompany, automations, addAutomation, deleteAutomation, toggleAutomation } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', trigger: TRIGGERS[0], action: ACTIONS[0] });

  const companyAutomations = automations.filter(a => a.companyId === currentCompany?.id);

  const handleAdd = () => {
    if (!form.name) return;
    addAutomation({ ...form, companyId: currentCompany.id, status: true });
    setShowAdd(false);
    setForm({ name: '', trigger: TRIGGERS[0], action: ACTIONS[0] });
  };

  const totalRuns = companyAutomations.reduce((s, a) => s + (a.runs || 0), 0);
  const activeCount = companyAutomations.filter(a => a.status).length;

  return (
    <div className="page-enter">
      <PageHeader title="Automation" subtitle="Set up workflows to automate repetitive tasks">
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> New Workflow</button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Workflows', value: companyAutomations.length, color: '#0EA5E9' },
          { label: 'Active', value: activeCount, color: '#10B981' },
          { label: 'Total Runs', value: totalRuns.toLocaleString(), color: '#A855F7' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <Activity size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {companyAutomations.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No Automations Yet"
          description="Create your first workflow to automate tasks, emails, and follow-ups."
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Workflow</button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {companyAutomations.map(auto => (
            <div key={auto.id} className="card p-4 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: auto.status ? 'rgba(14,165,233,0.12)' : 'rgba(100,116,139,0.08)' }}>
                    <Zap size={17} style={{ color: auto.status ? '#0EA5E9' : '#475569' }} />
                  </div>
                  <div>
                    <p className="font-700 text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{auto.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-700"
                        style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
                        ⚡ {auto.trigger}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-700"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        ✓ {auto.action}
                      </div>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                      Ran {auto.runs?.toLocaleString()} times
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="toggle-switch">
                    <input type="checkbox" checked={auto.status} onChange={() => toggleAutomation(auto.id)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <button onClick={() => setDeleteTarget(auto)} className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create Automation Workflow">
        <div className="flex flex-col gap-4">
          <FormGroup label="Workflow Name" required>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Welcome new leads" />
          </FormGroup>
          <FormGroup label="Trigger — When this happens...">
            <select className="select-field" value={form.trigger} onChange={e => setForm({...form, trigger: e.target.value})}>
              {TRIGGERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </FormGroup>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-700 text-sm"
              style={{ background: 'rgba(14,165,233,0.12)', color: '#0EA5E9' }}>↓</div>
          </div>
          <FormGroup label="Action — Do this automatically">
            <select className="select-field" value={form.action} onChange={e => setForm({...form, action: e.target.value})}>
              {ACTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </FormGroup>
          <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-xs font-700 mb-0.5" style={{ color: '#10B981' }}>Preview</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              When <strong style={{ color: 'var(--text-primary)' }}>{form.trigger}</strong> → Automatically <strong style={{ color: 'var(--text-primary)' }}>{form.action}</strong>
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}><Zap size={14} /> Create Workflow</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteAutomation(deleteTarget?.id)}
        title="Delete Automation"
        message={`Delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
