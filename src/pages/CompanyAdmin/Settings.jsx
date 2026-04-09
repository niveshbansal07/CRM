import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, FormGroup } from '../../components/common';
import { Save, Key, Bell, Palette, Globe, Shield, ChevronRight, Check } from 'lucide-react';

const INDUSTRIES = ['Technology','Retail','Education','Finance','Healthcare','Real Estate','Media','Manufacturing','Other'];
const TIMEZONES  = ['Asia/Kolkata (IST)','UTC','America/New_York (EST)','Europe/London (GMT)','Asia/Dubai (GST)'];
const CURRENCIES = ['INR (₹)','USD ($)','EUR (€)','GBP (£)','AED (د.إ)'];

function NavItem({ id, active, label, icon: Icon, onClick }) {
  const isActive = active === id;
  return (
    <button onClick={() => onClick(id)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-500 transition-all text-left"
      style={{ background: isActive ? 'rgba(14,165,233,0.12)' : 'transparent', color: isActive ? '#0EA5E9' : 'var(--text-muted)', borderLeft: isActive ? '2px solid #0EA5E9' : '2px solid transparent' }}>
      <Icon size={15} />{label}
      <ChevronRight size={13} className="ml-auto" style={{ opacity: isActive ? 1 : 0.4 }} />
    </button>
  );
}

export default function CASettings() {
  const { currentCompany, currentUser, updateCompany } = useAuth();
  const [section, setSection]   = useState('company');
  const [saved, setSaved]       = useState(false);
  const [form, setForm]         = useState({ name: currentCompany?.name||'', domain: currentCompany?.domain||'', industry: currentCompany?.industry||'Technology', timezone:'Asia/Kolkata (IST)', currency:'INR (₹)', dateFormat:'DD/MM/YYYY' });
  const [modNames, setModNames] = useState({ leads:'Leads', deals:'Deals', contacts:'Contacts', tasks:'Tasks', tickets:'Tickets' });
  const [notifs, setNotifs]     = useState({ newLead:true, dealWon:true, taskDue:true, teamUpdate:false, weeklyReport:true, systemAlerts:true });
  const [pwForm, setPwForm]     = useState({ current:'', newPass:'', confirm:'' });
  const [pwMsg, setPwMsg]       = useState('');

  const plan = currentCompany?.plan;
  const planColors = { free:'#64748B', pro:'#0EA5E9', enterprise:'#A855F7' };

  const save = () => { updateCompany(currentCompany.id, form); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const changePassword = () => {
    if (!pwForm.current)             { setPwMsg('Enter current password'); return; }
    if (pwForm.newPass.length < 6)   { setPwMsg('Min 6 characters required'); return; }
    if (pwForm.newPass !== pwForm.confirm) { setPwMsg('Passwords do not match'); return; }
    setPwMsg('✓ Password updated!'); setPwForm({ current:'', newPass:'', confirm:'' });
    setTimeout(() => setPwMsg(''), 3000);
  };

  return (
    <div className="page-enter">
      <PageHeader title="Settings" subtitle="Configure your company CRM" />
      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="card p-2 flex flex-col gap-1 sticky top-4">
            <NavItem id="company"  label="Company"        icon={Globe}   active={section} onClick={setSection} />
            <NavItem id="modules"  label="Module Names"   icon={Palette} active={section} onClick={setSection} />
            <NavItem id="notifs"   label="Notifications"  icon={Bell}    active={section} onClick={setSection} />
            <NavItem id="security" label="Security"       icon={Key}     active={section} onClick={setSection} />
            <NavItem id="plan"     label="Plan & Billing" icon={Shield}  active={section} onClick={setSection} />
          </div>
        </div>

        <div className="flex-1">
          {/* ── Company ── */}
          {section === 'company' && (
            <div className="card p-6">
              <p className="font-700 mb-1" style={{ color:'var(--text-primary)' }}>Company Information</p>
              <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>Core details visible across your CRM</p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Company Name" required><input className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></FormGroup>
                  <FormGroup label="Domain"><input className="input-field" value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})} /></FormGroup>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormGroup label="Industry">
                    <select className="select-field" value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})}>
                      {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="Timezone">
                    <select className="select-field" value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})}>
                      {TIMEZONES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="Currency">
                    <select className="select-field" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}>
                      {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </FormGroup>
                </div>
                <FormGroup label="Date Format">
                  <div className="flex gap-3">
                    {['DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD'].map(fmt=>(
                      <label key={fmt} className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg text-xs font-600"
                        style={{ background: form.dateFormat===fmt ? 'rgba(14,165,233,0.1)':'var(--bg-secondary)', border:`1px solid ${form.dateFormat===fmt ? 'rgba(14,165,233,0.3)':'var(--border-primary)'}`, color: form.dateFormat===fmt ? '#0EA5E9':'var(--text-secondary)' }}>
                        <input type="radio" name="df" checked={form.dateFormat===fmt} onChange={()=>setForm({...form,dateFormat:fmt})} style={{accentColor:'#0EA5E9'}} />
                        {fmt}
                      </label>
                    ))}
                  </div>
                </FormGroup>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4" style={{ borderTop:'1px solid var(--border-primary)' }}>
                <button className="btn-primary" onClick={save}>
                  {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
                </button>
                {saved && <p className="text-xs" style={{ color:'#10B981' }}>Changes saved.</p>}
              </div>
            </div>
          )}

          {/* ── Module Names ── */}
          {section === 'modules' && (
            <div className="card p-6">
              <p className="font-700 mb-1" style={{ color:'var(--text-primary)' }}>Module Name Customization</p>
              <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>Rename modules to match your business language (e.g. Leads → Students)</p>
              <div className="flex flex-col gap-3">
                {Object.entries(modNames).map(([key,val])=>(
                  <div key={key} className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-primary)' }}>
                    <div className="w-24 flex-shrink-0">
                      <p className="text-xs" style={{ color:'var(--text-muted)' }}>Default</p>
                      <p className="text-sm font-600" style={{ color:'var(--text-secondary)' }}>{key.charAt(0).toUpperCase()+key.slice(1)}</p>
                    </div>
                    <span style={{ color:'var(--text-muted)' }}>→</span>
                    <input className="input-field flex-1" value={val} style={{ height:36, fontSize:13 }}
                      onChange={e=>setModNames(p=>({...p,[key]:e.target.value}))}
                      placeholder={`e.g. ${key==='leads'?'Prospects':key==='deals'?'Opportunities':key}`} />
                    <span className="text-xs px-2 py-1 rounded-lg font-600" style={{ background:'rgba(14,165,233,0.08)', color:'#0EA5E9', flexShrink:0 }}>
                      {val||key}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-5 pt-4" style={{ borderTop:'1px solid var(--border-primary)' }}>
                <button className="btn-primary"><Save size={14} /> Save Names</button>
              </div>
            </div>
          )}

          {/* ── Notifications ── */}
          {section === 'notifs' && (
            <div className="card p-6">
              <p className="font-700 mb-1" style={{ color:'var(--text-primary)' }}>Notification Preferences</p>
              <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>Choose which events trigger alerts</p>
              <div className="flex flex-col gap-2">
                {[
                  { k:'newLead',      label:'New Lead Assigned',   desc:'When a lead is assigned to you' },
                  { k:'dealWon',      label:'Deal Won / Lost',      desc:'When deals reach a closed status' },
                  { k:'taskDue',      label:'Task Due Reminders',   desc:'24h before task due date' },
                  { k:'teamUpdate',   label:'Team Activity',        desc:'When teammates take actions' },
                  { k:'weeklyReport', label:'Weekly Summary',       desc:'Auto-generated Monday digest email' },
                  { k:'systemAlerts', label:'System Alerts',        desc:'Platform maintenance & critical notices' },
                ].map(n=>(
                  <div key={n.k} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-primary)' }}>
                    <div>
                      <p className="text-sm font-600" style={{ color:'var(--text-primary)' }}>{n.label}</p>
                      <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{n.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={notifs[n.k]} onChange={()=>setNotifs(p=>({...p,[n.k]:!p[n.k]}))} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {section === 'security' && (
            <div className="flex flex-col gap-4">
              <div className="card p-6">
                <p className="font-700 mb-1" style={{ color:'var(--text-primary)' }}>Change Password</p>
                <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>Update your account password</p>
                <div className="flex flex-col gap-4 max-w-sm">
                  <FormGroup label="Current Password"><input type="password" className="input-field" value={pwForm.current} onChange={e=>setPwForm({...pwForm,current:e.target.value})} placeholder="••••••••" /></FormGroup>
                  <FormGroup label="New Password"><input type="password" className="input-field" value={pwForm.newPass} onChange={e=>setPwForm({...pwForm,newPass:e.target.value})} placeholder="Min 6 characters" /></FormGroup>
                  <FormGroup label="Confirm Password"><input type="password" className="input-field" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} placeholder="Re-enter new password" /></FormGroup>
                  {pwMsg && <p className="text-xs font-600" style={{ color: pwMsg.startsWith('✓') ? '#10B981':'#EF4444' }}>{pwMsg}</p>}
                  <button className="btn-primary w-fit" onClick={changePassword}><Key size={14} /> Update Password</button>
                </div>
              </div>
              <div className="card p-6">
                <p className="font-700 mb-4" style={{ color:'var(--text-primary)' }}>Security Controls</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label:'Two-Factor Authentication', desc:'Require 2FA for admin logins', def:false },
                    { label:'Session Timeout (30min)',    desc:'Auto-logout after inactivity',  def:true  },
                    { label:'IP Whitelist',               desc:'Restrict to specific IPs',       def:false },
                    { label:'Login Audit Log',            desc:'Track all login attempts',       def:true  },
                  ].map(s=>(
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-primary)' }}>
                      <div>
                        <p className="text-sm font-600" style={{ color:'var(--text-primary)' }}>{s.label}</p>
                        <p className="text-xs" style={{ color:'var(--text-muted)' }}>{s.desc}</p>
                      </div>
                      <label className="toggle-switch"><input type="checkbox" defaultChecked={s.def} /><span className="toggle-slider"></span></label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Plan ── */}
          {section === 'plan' && (
            <div className="card p-6">
              <p className="font-700 mb-5" style={{ color:'var(--text-primary)' }}>Plan & Billing</p>
              <div className="flex items-center gap-4 p-4 rounded-2xl mb-6"
                style={{ background:`${planColors[plan]||'#64748B'}10`, border:`1px solid ${planColors[plan]||'#64748B'}30` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:`${planColors[plan]}20` }}>
                  <span className="font-display font-800 text-xl capitalize" style={{ color:planColors[plan] }}>{plan?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-display font-700 text-2xl capitalize" style={{ color:'var(--text-primary)' }}>{plan} Plan</p>
                  <p className="text-sm" style={{ color:planColors[plan] }}>
                    {plan==='free'?'Free forever':plan==='pro'?'₹49/month':'₹199/month'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label:'Team Members',  value:`${currentCompany?.users} active` },
                  { label:'Leads Tracked', value:currentCompany?.leads?.toLocaleString() },
                  { label:'Admin Email',   value:currentUser?.email },
                  { label:'Member Since',  value:currentCompany?.joinedDate },
                ].map(r=>(
                  <div key={r.label} className="p-3 rounded-xl" style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-primary)' }}>
                    <p className="text-xs mb-1" style={{ color:'var(--text-muted)' }}>{r.label}</p>
                    <p className="text-sm font-600" style={{ color:'var(--text-primary)' }}>{r.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl" style={{ background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.15)' }}>
                <p className="text-sm font-600 mb-1" style={{ color:'#0EA5E9' }}>Need a plan upgrade?</p>
                <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>Contact your TrackField account manager to upgrade your subscription.</p>
                <button className="btn-primary text-xs">Contact TrackField Sales ↗</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}