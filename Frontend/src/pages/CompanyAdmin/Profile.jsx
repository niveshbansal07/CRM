import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, FormGroup } from '../../components/common';
import {
  User, Mail, Phone, Building2, Briefcase, Calendar, Edit2, Save,
  CheckCircle2, TrendingUp, Layers, CheckSquare, Award, Star,
  Activity, Clock, Target, Zap, Camera, Lock, Bell, Shield,
  MessageSquare, ChevronRight, BarChart2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const ACTIVITY_LOG = [
  { time: '2h ago',    icon: TrendingUp,  color: '#0EA5E9', text: 'Added lead TechCorp Pvt Ltd',           type: 'lead'   },
  { time: '4h ago',    icon: CheckSquare, color: '#10B981', text: 'Completed task: Follow-up call',        type: 'task'   },
  { time: 'Yesterday', icon: Layers,      color: '#A855F7', text: 'Deal moved to Negotiation stage',       type: 'deal'   },
  { time: 'Yesterday', icon: Mail,        color: '#6366F1', text: 'Sent proposal email to StartupNest',   type: 'email'  },
  { time: '3 days ago',icon: Award,       color: '#F59E0B', text: 'Closed deal: MedPlus Annual Contract', type: 'win'    },
  { time: '4 days ago',icon: TrendingUp,  color: '#0EA5E9', text: 'Added 3 new leads from LinkedIn',      type: 'lead'   },
  { time: '5 days ago',icon: CheckSquare, color: '#10B981', text: 'Completed 5 follow-up tasks',          type: 'task'   },
];

const WEEKLY_PERF = [
  { day: 'Mon', score: 65 }, { day: 'Tue', score: 80 }, { day: 'Wed', score: 55 },
  { day: 'Thu', score: 90 }, { day: 'Fri', score: 75 }, { day: 'Sat', score: 40 },
];

const ACHIEVEMENTS = [
  { id: 1, icon: '🎯', title: 'First Deal Closed',   desc: 'Closed your very first deal',     earned: true  },
  { id: 2, icon: '🔥', title: 'Hot Streak',           desc: '5 leads contacted in one day',    earned: true  },
  { id: 3, icon: '⭐', title: 'Star Performer',       desc: 'Exceeded monthly target by 20%',  earned: true  },
  { id: 4, icon: '📞', title: '50 Calls Made',        desc: 'Made 50+ calls this month',       earned: false },
  { id: 5, icon: '🏆', title: 'Top Sales Rep',        desc: 'Ranked #1 in team this quarter', earned: false },
  { id: 6, icon: '💡', title: 'Lead Machine',         desc: 'Added 100+ leads this year',      earned: false },
];

const ROLE_COLORS = {
  sales:         { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  label: 'Sales Rep'     },
  manager:       { color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)',  label: 'Manager'       },
  support:       { color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  label: 'Support'       },
  finance:       { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  label: 'Finance'       },
  company_admin: { color: '#A855F7', bg: 'rgba(168,85,247,0.12)', label: 'Company Admin' },
};

export default function UProfile() {
  const { currentUser, currentCompany, leads, deals, tasks, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode,  setEditMode]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [form, setForm] = useState({
    name:       currentUser?.name       || '',
    phone:      currentUser?.phone      || '+91 9876543210',
    bio:        currentUser?.bio        || 'Passionate about building relationships and closing deals.',
    location:   currentUser?.location   || 'Mumbai, India',
    linkedIn:   currentUser?.linkedIn   || 'linkedin.com/in/profile',
    department: currentUser?.department || '',
  });

  const roleConf  = ROLE_COLORS[currentUser?.role] || ROLE_COLORS.sales;
  const myLeads   = leads.filter(l => l.assignedTo === currentUser?.id);
  const myDeals   = deals.filter(d => d.assignedTo === currentUser?.id);
  const myTasks   = tasks.filter(t => t.assignedTo === currentUser?.id);
  const wonDeals  = myDeals.filter(d => d.stage === 'Closed Won');
  const wonValue  = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const doneTasks = myTasks.filter(t => t.status === 'completed');
  const taskRate  = myTasks.length ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;
  const convRate  = myLeads.length ? Math.round((wonDeals.length / myLeads.length) * 100) : 0;

  const STATS = [
    { label: 'Leads Assigned', value: myLeads.length, color: '#0EA5E9', icon: TrendingUp },
    { label: 'Deals Won',      value: wonDeals.length, color: '#10B981', icon: Award     },
    { label: 'Revenue Won',    value: `₹${(wonValue/1000).toFixed(0)}K`, color: '#A855F7', icon: BarChart2 },
    { label: 'Tasks Done',     value: doneTasks.length, color: '#F59E0B', icon: CheckSquare },
  ];

  const handleSave = () => {
    updateUser(currentUser.id, form);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: 'overview',      label: 'Overview'      },
    { id: 'activity',      label: 'Activity'      },
    { id: 'achievements',  label: 'Achievements'  },
    { id: 'edit',          label: 'Edit Profile'  },
  ];

  return (
    <div className="page-enter">
      {/* Profile Hero */}
      <div className="card p-6 mb-5 relative overflow-hidden">
        {/* Background gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-24" style={{
          background: `linear-gradient(135deg, ${roleConf.color}18, transparent)`,
        }}></div>

        <div className="relative flex flex-col md:flex-row items-start md:items-end gap-5 pt-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-700 shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${roleConf.color}, ${roleConf.color}88)`, color: 'white', letterSpacing:'-0.02em' }}>
              {currentUser?.avatar || currentUser?.name?.[0]}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{ background: '#10B981', borderColor: 'var(--bg-card)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'white' }}></div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>
                {currentUser?.name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-700"
                style={{ background: roleConf.bg, color: roleConf.color }}>
                {roleConf.label}
              </span>
              {saved && <span className="text-xs font-700 px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>✓ Profile saved!</span>}
            </div>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              {form.bio}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Mail size={12}/> {currentUser?.email}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Building2 size={12}/> {currentCompany?.name}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Briefcase size={12}/> {currentUser?.department}
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock size={12}/> Last active: {currentUser?.lastLogin}
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button onClick={() => setActiveTab('edit')}
            className="btn-secondary text-xs flex-shrink-0">
            <Edit2 size={13}/> Edit Profile
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5" style={{ borderTop: '1px solid var(--border-primary)' }}>
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}18` }}>
                  <Icon size={16} style={{ color: s.color }}/>
                </div>
                <div>
                  <p className="font-display font-700 text-xl" style={{ color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-600 transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: activeTab === tab.id ? '1px solid var(--border-primary)' : '1px solid transparent',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Performance chart */}
            <div className="card p-5">
              <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Weekly Performance Score</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Activity score based on tasks, calls & deals</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={WEEKLY_PERF}>
                  <defs>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={roleConf.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={roleConf.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <YAxis hide domain={[0, 100]}/>
                  <Tooltip formatter={(v) => [`${v}/100`, 'Score']} />
                  <Area type="monotone" dataKey="score" stroke={roleConf.color} strokeWidth={2.5} fill="url(#profGrad)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Skill / KPI breakdown */}
            <div className="card p-5">
              <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Performance Breakdown</p>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Lead Conversion Rate', value: convRate, max: 100, color: '#0EA5E9', unit: '%' },
                  { label: 'Task Completion Rate', value: taskRate, max: 100, color: '#10B981', unit: '%' },
                  { label: 'Deals in Pipeline',    value: myDeals.filter(d=>!['Closed Won','Closed Lost'].includes(d.stage)).length, max: 10, color: '#6366F1', unit: '' },
                  { label: 'Leads This Month',     value: myLeads.length, max: 30, color: '#F59E0B', unit: '' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                      <span className="text-xs font-700" style={{ color: m.color }}>{m.value}{m.unit}</span>
                    </div>
                    <div className="h-2.5 rounded-full" style={{ background: 'var(--border-primary)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min((m.value/m.max)*100,100)}%`, background: m.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Profile card */}
            <div className="card p-5">
              <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Profile Info</p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: User,      label: 'Full Name',   value: currentUser?.name     },
                  { icon: Mail,      label: 'Email',       value: currentUser?.email    },
                  { icon: Phone,     label: 'Phone',       value: form.phone            },
                  { icon: Briefcase, label: 'Department',  value: currentUser?.department },
                  { icon: Building2, label: 'Company',     value: currentCompany?.name  },
                  { icon: Calendar,  label: 'Last Login',  value: currentUser?.lastLogin },
                ].map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.label} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--bg-secondary)' }}>
                        <Icon size={13} style={{ color: 'var(--text-muted)' }}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</p>
                        <p className="text-sm font-600 truncate" style={{ color: 'var(--text-primary)' }}>{r.value || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Win box */}
            <div className="card p-5" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(14,165,233,0.06))', borderColor: 'rgba(16,185,129,0.2)' }}>
              <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>🏆 Quick Wins</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>What you've accomplished</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: `${myLeads.length} leads managed`, icon: '📋' },
                  { label: `${wonDeals.length} deals won`, icon: '🤝' },
                  { label: `₹${(wonValue/1000).toFixed(0)}K revenue generated`, icon: '💰' },
                  { label: `${doneTasks.length} tasks completed`, icon: '✅' },
                ].map((w, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span style={{ fontSize: 14 }}>{w.icon}</span>
                    <p className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{w.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div className="flex items-center gap-2">
                <Activity size={15} style={{ color: '#0EA5E9' }}/>
                <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Recent Activity</p>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Everything you've done recently</p>
            </div>
            <div>
              {ACTIVITY_LOG.map((a, i) => {
                const Icon = a.icon;
                const isLast = i === ACTIVITY_LOG.length - 1;
                return (
                  <div key={i} className="flex items-start gap-4 px-5 py-4 relative"
                    style={{ borderBottom: isLast ? 'none' : '1px solid rgba(30,45,69,0.4)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {/* Timeline line */}
                    {!isLast && <div className="absolute left-11 top-12 bottom-0 w-px" style={{ background: 'rgba(30,45,69,0.5)' }}></div>}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${a.color}15` }}>
                      <Icon size={14} style={{ color: a.color }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600" style={{ color: 'var(--text-primary)' }}>{a.text}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.time}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: a.color }}></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>This Month Summary</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Activities logged', value: ACTIVITY_LOG.length, color: '#0EA5E9' },
                  { label: 'Leads added',        value: myLeads.length, color: '#6366F1'    },
                  { label: 'Deals progressed',   value: myDeals.length, color: '#A855F7'    },
                  { label: 'Tasks completed',    value: doneTasks.length, color: '#10B981'  },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid rgba(30,45,69,0.4)' }}>
                    <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span className="font-display font-700 text-lg" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-sm font-700 mb-3" style={{ color: 'var(--text-primary)' }}>Upcoming Tasks</p>
              {myTasks.filter(t=>t.status==='pending').slice(0,4).map(t => (
                <div key={t.id} className="flex items-start gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#0EA5E9' }}></div>
                  <div>
                    <p className="text-xs font-600" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.dueDate}</p>
                  </div>
                </div>
              ))}
              {myTasks.filter(t=>t.status==='pending').length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No pending tasks 🎉</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ACHIEVEMENTS TAB ── */}
      {activeTab === 'achievements' && (
        <div>
          <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <Award size={20} style={{ color: '#F59E0B' }}/>
            </div>
            <div>
              <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>
                {ACHIEVEMENTS.filter(a=>a.earned).length} / {ACHIEVEMENTS.length} Achievements Unlocked
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Keep working to unlock more!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(a => (
              <div key={a.id} className={`card p-5 transition-all ${a.earned ? 'card-hover' : ''}`}
                style={{
                  opacity: a.earned ? 1 : 0.5,
                  borderColor: a.earned ? 'rgba(245,158,11,0.2)' : 'var(--border-primary)',
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: a.earned ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.08)',
                      filter: a.earned ? 'none' : 'grayscale(1)',
                    }}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{a.title}</p>
                      {a.earned && <span style={{ fontSize: 10, color: '#F59E0B' }}>✓ EARNED</span>}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE TAB ── */}
      {activeTab === 'edit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Personal Info */}
            <div className="card p-6">
              <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Personal Information</p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Full Name">
                    <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </FormGroup>
                  <FormGroup label="Phone Number">
                    <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9876543210"/>
                  </FormGroup>
                </div>
                <FormGroup label="Bio / About Me">
                  <textarea
                    className="input-field" rows={3} value={form.bio}
                    onChange={e => setForm({...form, bio: e.target.value})}
                    placeholder="Tell your team a bit about yourself..."
                    style={{ resize: 'vertical', fontFamily: 'DM Sans, sans-serif' }}
                  />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Location">
                    <input className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="City, Country"/>
                  </FormGroup>
                  <FormGroup label="LinkedIn URL">
                    <input className="input-field" value={form.linkedIn} onChange={e => setForm({...form, linkedIn: e.target.value})} placeholder="linkedin.com/in/..."/>
                  </FormGroup>
                </div>
              </div>
            </div>

            {/* Read-only fields */}
            <div className="card p-6">
              <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Account Details</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>These are managed by your Company Admin</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Email Address', value: currentUser?.email     },
                  { label: 'Department',    value: currentUser?.department },
                  { label: 'Role',          value: currentUser?.role       },
                  { label: 'Company',       value: currentCompany?.name    },
                ].map(f => (
                  <div key={f.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                    <p className="text-xs font-700 mb-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                    <p className="text-sm font-600" style={{ color: 'var(--text-secondary)' }}>{f.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-primary" onClick={handleSave}><Save size={14}/> Save Profile</button>
              <button className="btn-secondary" onClick={() => setActiveTab('overview')}>Cancel</button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <p className="text-xs font-700 uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Live Preview</p>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-700 mb-3"
                  style={{ background: `linear-gradient(135deg, ${roleConf.color}, ${roleConf.color}88)`, color: 'white' }}>
                  {form.name?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-700 text-base" style={{ color: 'var(--text-primary)' }}>{form.name || 'Your Name'}</p>
                <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</p>
                <span className="px-3 py-1 rounded-full text-xs font-700" style={{ background: roleConf.bg, color: roleConf.color }}>
                  {roleConf.label}
                </span>
                {form.bio && (
                  <p className="text-xs mt-3 text-center leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{form.bio}</p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Security</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Change Password', icon: Lock    },
                  { label: 'Notifications',   icon: Bell    },
                  { label: 'Privacy',         icon: Shield  },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <button key={s.label} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-600 transition-all"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(14,165,233,0.3)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-primary)'}>
                      <span className="flex items-center gap-2"><Icon size={14}/> {s.label}</span>
                      <ChevronRight size={13} style={{ color: 'var(--text-muted)' }}/>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}