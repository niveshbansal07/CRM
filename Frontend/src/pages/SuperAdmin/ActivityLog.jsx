import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge } from '../../components/common';
import { Activity, Search, Filter, Building2, Users, Package, TrendingUp, Zap, Shield } from 'lucide-react';

// Mock activity log — in a real app this would come from the backend
const MOCK_LOGS = [
  { id:'log1', time:'2 min ago',    actor:'Arjun Mehta',     company:'Nexora Solutions', action:'Created lead',       target:'TechCorp Pvt Ltd',    type:'lead',    severity:'info'    },
  { id:'log2', time:'8 min ago',    actor:'Kavya Nair',      company:'Nexora Solutions', action:'Deal moved to',      target:'Negotiation stage',   type:'deal',    severity:'success' },
  { id:'log3', time:'15 min ago',   actor:'owner@trackfield',company:'TRACKFIELD',       action:'Activated company',  target:'BlueWave Retail',      type:'admin',   severity:'info'    },
  { id:'log4', time:'32 min ago',   actor:'Rohan Das',       company:'Nexora Solutions', action:'Added contact',      target:'StartupNest',          type:'contact', severity:'info'    },
  { id:'log5', time:'1 hour ago',   actor:'Sneha Iyer',      company:'FinVault Capital', action:'Deal closed won',    target:'FinVault Premium Licence', type:'deal', severity:'success' },
  { id:'log6', time:'1 hour ago',   actor:'owner@trackfield',company:'TRACKFIELD',       action:'Changed plan to',    target:'Enterprise — FinVault',type:'admin',   severity:'warning' },
  { id:'log7', time:'2 hours ago',  actor:'Priya Sharma',    company:'BlueWave Retail',  action:'Added employee',     target:'Ananya Roy',           type:'user',    severity:'info'    },
  { id:'log8', time:'3 hours ago',  actor:'Rahul Verma',     company:'EduPath Academy',  action:'Enabled module',     target:'Automation',           type:'module',  severity:'info'    },
  { id:'log9', time:'4 hours ago',  actor:'owner@trackfield',company:'TRACKFIELD',       action:'Created company',    target:'EduPath Academy',      type:'admin',   severity:'success' },
  { id:'log10','time':'5 hours ago',actor:'Sana Khan',       company:'EduPath Academy',  action:'Lead qualified',     target:'DPS School Group',     type:'lead',    severity:'success' },
  { id:'log11','time':'6 hours ago',actor:'owner@trackfield',company:'TRACKFIELD',       action:'Suspended user',     target:'Dev Kapoor',           type:'admin',   severity:'danger'  },
  { id:'log12','time':'Yesterday',  actor:'Nikhil Gupta',    company:'FinVault Capital', action:'Workflow triggered', target:'Auto-assign leads',    type:'auto',    severity:'info'    },
  { id:'log13','time':'Yesterday',  actor:'Vikram Joshi',    company:'BlueWave Retail',  action:'Updated lead status',target:'Fashion Hub Delhi',    type:'lead',    severity:'info'    },
  { id:'log14','time':'Yesterday',  actor:'owner@trackfield',company:'TRACKFIELD',       action:'Disabled module',    target:'AI Features — Sparkify', type:'admin', severity:'warning' },
  { id:'log15','time':'2 days ago', actor:'Arjun Mehta',     company:'Nexora Solutions', action:'Created automation', target:'Follow-up reminder',   type:'auto',    severity:'info'    },
];

const TYPE_ICONS = {
  lead:    { icon: TrendingUp, color: '#0EA5E9' },
  deal:    { icon: Package,    color: '#10B981' },
  contact: { icon: Users,      color: '#6366F1' },
  user:    { icon: Users,      color: '#A855F7' },
  admin:   { icon: Shield,     color: '#F59E0B' },
  module:  { icon: Zap,        color: '#F59E0B' },
  auto:    { icon: Zap,        color: '#6366F1' },
};

const SEVERITY_STYLES = {
  info:    { bg:'rgba(14,165,233,0.08)',  text:'#0EA5E9',  dot:'#0EA5E9'  },
  success: { bg:'rgba(16,185,129,0.08)',  text:'#10B981',  dot:'#10B981'  },
  warning: { bg:'rgba(245,158,11,0.08)', text:'#F59E0B',  dot:'#F59E0B'  },
  danger:  { bg:'rgba(239,68,68,0.08)',   text:'#EF4444',  dot:'#EF4444'  },
};

export default function SAActivityLog() {
  const { companies } = useAuth();
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterComp, setFilterComp] = useState('all');

  const filtered = MOCK_LOGS.filter(l => {
    const matchSearch = l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || l.type === filterType;
    const matchComp = filterComp === 'all' || l.company === filterComp;
    return matchSearch && matchType && matchComp;
  });

  return (
    <div className="page-enter">
      <PageHeader title="Activity Log" subtitle="Real-time audit trail across the entire platform">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-700"
          style={{ background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background:'#10B981' }}></span>
          Live
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label:'Events Today', value: MOCK_LOGS.filter(l=>l.time.includes('min')||l.time.includes('hour')).length, color:'#0EA5E9' },
          { label:'Admin Actions', value: MOCK_LOGS.filter(l=>l.type==='admin').length, color:'#A855F7' },
          { label:'Deal Events', value: MOCK_LOGS.filter(l=>l.type==='deal').length, color:'#10B981' },
          { label:'Warnings', value: MOCK_LOGS.filter(l=>l.severity==='warning'||l.severity==='danger').length, color:'#F59E0B' },
        ].map(s => (
          <div key={s.label} className="card p-3 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background:`${s.color}50` }}></div>
            <div>
              <p className="font-display font-700 text-xl" style={{ color:s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color:'var(--text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }} />
          <input className="input-field pl-9" placeholder="Search actor, action, target..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width:140 }} value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {['lead','deal','contact','user','admin','module','auto'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
        <select className="select-field" style={{ width:160 }} value={filterComp} onChange={e=>setFilterComp(e.target.value)}>
          <option value="all">All Companies</option>
          <option value="TRACKFIELD">TRACKFIELD (Admin)</option>
          {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* Log stream */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom:'1px solid var(--border-primary)', background:'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2">
            <Activity size={14} style={{ color:'#0EA5E9' }} />
            <p className="text-xs font-700 uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>
              {filtered.length} Events
            </p>
          </div>
          <p className="text-xs font-mono" style={{ color:'var(--text-muted)' }}>Latest first</p>
        </div>

        <div className="divide-y" style={{ '--divide-color':'rgba(30,45,69,0.5)' }}>
          {filtered.map((log, idx) => {
            const typeConf = TYPE_ICONS[log.type] || TYPE_ICONS.lead;
            const TypeIcon = typeConf.icon;
            const sev = SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.info;
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 transition-colors"
                style={{ borderBottom:'1px solid rgba(30,45,69,0.4)' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {/* Icon */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background:`${typeConf.color}12` }}>
                  <TypeIcon size={14} style={{ color:typeConf.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-700" style={{ color:'var(--text-primary)' }}>{log.actor}</span>
                    <span className="text-sm" style={{ color:'var(--text-secondary)' }}>{log.action}</span>
                    <span className="text-sm font-600" style={{ color:'#0EA5E9' }}>{log.target}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color:'var(--text-muted)' }}>{log.time}</span>
                    <span style={{ color:'var(--text-muted)', fontSize:10 }}>·</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-700"
                      style={{ background:sev.bg, color:sev.text }}>
                      {log.company}
                    </span>
                  </div>
                </div>

                {/* Severity */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ background:sev.dot }}></div>
                  <span className="text-xs font-600 capitalize" style={{ color:sev.text }}>{log.severity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}