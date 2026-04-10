import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import { Plus, Zap, Trash2, Activity, ArrowRight, CheckCircle2, Clock, Mail, MessageSquare, UserCheck, Bell, FileText, RefreshCw } from 'lucide-react';

const TRIGGERS = [
  { value: 'Lead Created',        label: 'Lead Created',         icon: '📥', color: '#0EA5E9' },
  { value: 'Lead Status Changed', label: 'Status Changed',        icon: '🔄', color: '#6366F1' },
  { value: 'Deal Created',        label: 'Deal Created',          icon: '💼', color: '#10B981' },
  { value: 'Deal Stage Changed',  label: 'Deal Stage Changed',    icon: '📊', color: '#F59E0B' },
  { value: 'Deal Closed Won',     label: 'Deal Closed Won 🎉',    icon: '🏆', color: '#A855F7' },
  { value: 'Task Created',        label: 'Task Created',          icon: '✅', color: '#14B8A6' },
  { value: 'Task Overdue',        label: 'Task Overdue',          icon: '⚠️', color: '#EF4444' },
  { value: 'No Contact 3 Days',   label: 'No Contact 3 Days',     icon: '😴', color: '#F97316' },
  { value: 'Payment Received',    label: 'Payment Received',      icon: '💰', color: '#10B981' },
  { value: 'New User Added',      label: 'New User Added',        icon: '👤', color: '#8B5CF6' },
];

const ACTIONS = [
  { value: 'Send Email',                     label: 'Send Email',                icon: Mail,         color: '#0EA5E9' },
  { value: 'Create Task',                    label: 'Create Task',               icon: CheckCircle2, color: '#10B981' },
  { value: 'Assign to Sales Round Robin',    label: 'Assign Round Robin',        icon: RefreshCw,    color: '#6366F1' },
  { value: 'Send Slack Notification',        label: 'Slack Notification',        icon: MessageSquare,color: '#F59E0B' },
  { value: 'Notify Manager',                 label: 'Notify Manager',            icon: Bell,         color: '#A855F7' },
  { value: 'Update Lead Status',             label: 'Update Lead Status',        icon: UserCheck,    color: '#14B8A6' },
  { value: 'Send Welcome Email',             label: 'Send Welcome Email',        icon: Mail,         color: '#EC4899' },
  { value: 'Send Email + Brochure',          label: 'Email + Brochure',          icon: FileText,     color: '#F97316' },
  { value: 'Create Deal',                    label: 'Create Deal',               icon: Zap,          color: '#8B5CF6' },
  { value: 'Send SMS',                       label: 'Send SMS',                  icon: MessageSquare,color: '#EF4444' },
];

const TEMPLATE_WORKFLOWS = [
  { name:'Welcome New Leads',      trigger:'Lead Created',       action:'Send Welcome Email',           description:'Auto-send welcome email when any new lead enters the CRM.' },
  { name:'Overdue Task Alert',     trigger:'Task Overdue',       action:'Notify Manager',               description:'Ping the manager whenever a task passes its due date.' },
  { name:'Deal Won Celebration',   trigger:'Deal Closed Won',    action:'Send Slack Notification',      description:'Send a team Slack alert every time a deal is won.' },
  { name:'No-Touch Lead Nudge',    trigger:'No Contact 3 Days',  action:'Create Task',                  description:'Auto-create follow-up task for leads untouched for 3 days.' },
];

export default function CAAutomation() {
  const { currentCompany, automations, addAutomation, deleteAutomation, toggleAutomation } = useAuth();
  const [showAdd, setShowAdd]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', trigger: TRIGGERS[0].value, action: ACTIONS[0].value });

  const companyAutomations = automations.filter(a => a.companyId === currentCompany?.id);
  const totalRuns   = companyAutomations.reduce((s, a) => s + (a.runs || 0), 0);
  const activeCount = companyAutomations.filter(a => a.status).length;

  const handleAdd = () => {
    if (!form.name) return;
    addAutomation({ ...form, companyId: currentCompany.id, status: true });
    setShowAdd(false);
    setForm({ name: '', trigger: TRIGGERS[0].value, action: ACTIONS[0].value });
  };

  const addTemplate = (tpl) => {
    addAutomation({ ...tpl, companyId: currentCompany.id, status: true });
  };

  const getTrigger = (v) => TRIGGERS.find(t => t.value === v) || TRIGGERS[0];
  const getAction  = (v) => ACTIONS.find(a => a.value === v)  || ACTIONS[0];

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <Zap size={14} style={{ color:'#F59E0B' }} />
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#F59E0B' }}>Workflow Engine</span>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--text-primary)' }}>Automation</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
            {companyAutomations.length} workflows · {activeCount} active · {totalRuns.toLocaleString()} total runs
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Workflow</button>
      </div>

      {/* KPI Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Total Workflows', value:companyAutomations.length, color:'#0EA5E9' },
          { label:'Active',          value:activeCount,               color:'#10B981' },
          { label:'Total Runs',      value:totalRuns.toLocaleString(), color:'#A855F7' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding:'12px 16px' }}>
            <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:5 }}>{k.label}</p>
            <p style={{ fontSize:22, fontWeight:700, color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Template Workflows */}
      <div className="card" style={{ padding:'16px 20px', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>⚡ Quick Start Templates</p>
            <p style={{ fontSize:11, color:'var(--text-muted)' }}>One-click automation for common workflows</p>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8 }}>
          {TEMPLATE_WORKFLOWS.map(tpl => {
            const already = companyAutomations.some(a => a.name === tpl.name);
            const triggerInfo = getTrigger(tpl.trigger);
            return (
              <div key={tpl.name} style={{ padding:'12px 14px', borderRadius:12, background:'var(--bg-secondary)', border:'1px solid var(--border-primary)', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:14 }}>{triggerInfo.icon}</span>
                    <p style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>{tpl.name}</p>
                  </div>
                  <p style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.4, marginBottom:6 }}>{tpl.description}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20, background:`${triggerInfo.color}15`, color:triggerInfo.color }}>{tpl.trigger}</span>
                    <ArrowRight size={8} style={{ color:'var(--text-muted)' }} />
                    <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(16,185,129,0.1)', color:'#10B981' }}>{tpl.action}</span>
                  </div>
                </div>
                <button onClick={() => !already && addTemplate(tpl)} disabled={already}
                  style={{ padding:'5px 10px', borderRadius:8, fontSize:10, fontWeight:700, cursor:already?'not-allowed':'pointer', flexShrink:0, whiteSpace:'nowrap',
                    background:already?'var(--bg-secondary)':'rgba(14,165,233,0.1)', color:already?'var(--text-muted)':'#0EA5E9',
                    border:`1px solid ${already?'var(--border-primary)':'rgba(14,165,233,0.3)'}` }}>
                  {already ? '✓ Added' : '+ Use'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow List */}
      {companyAutomations.length === 0 ? (
        <EmptyState icon={Zap} title="No Automations Yet"
          description="Create your first workflow or use a template above to automate tasks, emails, and follow-ups."
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Workflow</button>} />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:4 }}>Your Workflows ({companyAutomations.length})</p>
          {companyAutomations.map(auto => {
            const triggerInfo = getTrigger(auto.trigger);
            const actionInfo  = getAction(auto.action);
            const ActionIcon  = actionInfo.icon;
            return (
              <div key={auto.id} className="card" style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                    {/* Status indicator */}
                    <div style={{ width:38, height:38, borderRadius:11, flexShrink:0,
                      background: auto.status ? 'rgba(14,165,233,0.1)' : 'rgba(100,116,139,0.08)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                      {triggerInfo.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>{auto.name}</p>
                      {/* Trigger → Action chain */}
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:`${triggerInfo.color}12`, color:triggerInfo.color }}>
                          ⚡ {auto.trigger}
                        </span>
                        <ArrowRight size={10} style={{ color:'var(--text-muted)', flexShrink:0 }} />
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <ActionIcon size={10} style={{ color:actionInfo.color }} />
                          <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:`${actionInfo.color}12`, color:actionInfo.color }}>
                            {auto.action}
                          </span>
                        </div>
                        <span style={{ fontSize:10, color:'var(--text-muted)', marginLeft:4 }}>
                          · {auto.runs?.toLocaleString() || 0} runs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle + Delete */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20,
                      background: auto.status ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                      color: auto.status ? '#10B981' : '#64748B' }}>
                      {auto.status ? '● Active' : '○ Paused'}
                    </span>
                    <label style={{ position:'relative', display:'inline-block', width:36, height:20, cursor:'pointer' }}>
                      <input type="checkbox" checked={auto.status} onChange={() => toggleAutomation(auto.id)} style={{ opacity:0, width:0, height:0 }} />
                      <span style={{ position:'absolute', top:0, left:0, right:0, bottom:0, borderRadius:20, transition:'0.2s',
                        background: auto.status ? '#0EA5E9' : 'var(--border-primary)' }}>
                        <span style={{ position:'absolute', width:14, height:14, borderRadius:'50%', background:'white', top:3, transition:'0.2s',
                          left: auto.status ? 18 : 3 }} />
                      </span>
                    </label>
                    <button onClick={() => setDeleteTarget(auto)} style={{ padding:6, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}
                      onMouseEnter={e => e.currentTarget.style.color='#EF4444'} onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Create Automation Workflow" width={520}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <FormGroup label="Workflow Name" required>
            <input className="input-field" value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g., Welcome New Leads" />
          </FormGroup>

          {/* Trigger */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:8 }}>Step 1 — When this happens (Trigger)</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:6 }}>
              {TRIGGERS.map(t => (
                <button key={t.value} onClick={() => setForm({...form, trigger:t.value})}
                  style={{ padding:'8px 10px', borderRadius:9, fontSize:11, fontWeight:700, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:7, transition:'all 0.12s',
                    background: form.trigger===t.value ? `${t.color}15` : 'var(--bg-secondary)',
                    border: `1px solid ${form.trigger===t.value ? t.color+'40' : 'var(--border-primary)'}`,
                    color: form.trigger===t.value ? t.color : 'var(--text-muted)' }}>
                  <span style={{ fontSize:14 }}>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(14,165,233,0.1)', color:'#0EA5E9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>↓</div>
          </div>

          {/* Action */}
          <div>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:8 }}>Step 2 — Then do this (Action)</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:6 }}>
              {ACTIONS.map(a => {
                const Icon = a.icon;
                return (
                  <button key={a.value} onClick={() => setForm({...form, action:a.value})}
                    style={{ padding:'8px 10px', borderRadius:9, fontSize:11, fontWeight:700, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:7, transition:'all 0.12s',
                      background: form.action===a.value ? `${a.color}15` : 'var(--bg-secondary)',
                      border: `1px solid ${form.action===a.value ? a.color+'40' : 'var(--border-primary)'}`,
                      color: form.action===a.value ? a.color : 'var(--text-muted)' }}>
                    <Icon size={12} /> {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <p style={{ fontSize:10, fontWeight:700, color:'#10B981', marginBottom:4 }}>✓ Workflow Preview</p>
            <p style={{ fontSize:12, color:'var(--text-secondary)' }}>
              When <strong style={{ color:'var(--text-primary)' }}>{form.trigger}</strong>
              <span style={{ margin:'0 6px', color:'var(--text-muted)' }}>→ automatically →</span>
              <strong style={{ color:'var(--text-primary)' }}>{form.action}</strong>
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}><Zap size={13} /> Activate Workflow</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteAutomation(deleteTarget?.id)}
        title="Delete Workflow" message={`Delete "${deleteTarget?.name}"?`} />
    </div>
  );
}
