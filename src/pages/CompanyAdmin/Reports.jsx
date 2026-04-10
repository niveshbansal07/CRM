import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/common';
import { REVENUE_DATA, CONVERSION_DATA, LEAD_SOURCE_DATA } from '../../data/mockData';
import { TrendingUp, DollarSign, Users, Target, Download, BarChart2, PieChart as PieIcon, Activity, Award } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';

const RANGES = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months', 'This Year'];

const ChartTip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#0EA5E9', fontSize: 13, fontWeight: 700 }}>
            {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CAReports() {
  const { currentCompany, leads, deals, tasks, users } = useAuth();
  const [dateRange, setDateRange] = useState('Last 3 months');
  const [activeTab, setActiveTab]  = useState('overview'); // overview | team | sources

  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id);
  const companyTasks = tasks.filter(t => t.companyId === currentCompany?.id);

  const wonDeals   = companyDeals.filter(d => d.stage === 'Closed Won');
  const lostDeals  = companyDeals.filter(d => d.stage === 'Closed Lost');
  const wonValue   = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const winRate    = companyDeals.length ? Math.round((wonDeals.length / companyDeals.length) * 100) : 0;
  const pipelineValue = companyDeals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
  const completedTasks  = companyTasks.filter(t => t.status === 'completed').length;
  const taskCompletion  = companyTasks.length ? Math.round((completedTasks / companyTasks.length) * 100) : 0;

  // Lead funnel
  const funnelStages = [
    { label: 'Total Leads',   value: companyLeads.length,                                       color: '#0EA5E9' },
    { label: 'Contacted',     value: companyLeads.filter(l => l.status !== 'new').length,        color: '#6366F1' },
    { label: 'Qualified',     value: companyLeads.filter(l => l.status === 'qualified').length,  color: '#F59E0B' },
    { label: 'Proposal Sent', value: companyLeads.filter(l => l.status === 'proposal').length,   color: '#A855F7' },
    { label: 'Deals Won',     value: wonDeals.length,                                            color: '#10B981' },
  ];
  const funnelMax = funnelStages[0]?.value || 1;

  // Lead status distribution
  const leadStatuses = ['new','contacted','qualified','proposal','lost'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: companyLeads.filter(l => l.status === s).length,
    color: { new:'#0EA5E9', contacted:'#6366F1', qualified:'#F59E0B', proposal:'#A855F7', lost:'#EF4444' }[s],
  })).filter(s => s.value > 0);

  // Deal stage distribution
  const PIPELINE_STAGES = ['Prospecting','Discovery','Proposal','Negotiation','Closed Won','Closed Lost'];
  const stageData = PIPELINE_STAGES.map(s => ({
    stage: s.replace('Closed ',''),
    count: companyDeals.filter(d => d.stage === s).length,
    value: companyDeals.filter(d => d.stage === s).reduce((sum, d) => sum + (d.value||0), 0),
  }));

  // Team performance
  const salesTeam = companyUsers.filter(u => ['sales','manager','customer_success'].includes(u.role));
  const teamData = salesTeam.map(u => ({
    name:   u.name.split(' ')[0],
    role:   u.role,
    leads:  leads.filter(l => l.assignedTo === u.id).length,
    deals:  deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').length,
    value:  deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').reduce((s, d) => s + (d.value||0), 0),
  })).sort((a, b) => b.value - a.value);

  // Source breakdown from real data
  const sourceCounts = {};
  companyLeads.forEach(l => { if (l.source) sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1; });
  const sourceData = Object.entries(sourceCounts).map(([name, count]) => ({
    name, count, pct: Math.round((count / companyLeads.length) * 100) || 0,
  })).sort((a, b) => b.count - a.count);

  const TABS = [
    { id: 'overview', label: 'Overview',      icon: BarChart2 },
    { id: 'team',     label: 'Team',          icon: Users },
    { id: 'sources',  label: 'Lead Sources',  icon: PieIcon },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <Activity size={14} style={{ color:'#A855F7' }} />
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#A855F7' }}>Business Intelligence</span>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--text-primary)' }}>Reports & Analytics</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
            {companyLeads.length} leads · {companyDeals.length} deals · {companyUsers.length} team members
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <select className="select-field" style={{ fontSize:12 }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
            {RANGES.map(r => <option key={r}>{r}</option>)}
          </select>
          <button className="btn-secondary" style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10, marginBottom:16 }}>
        {[
          { title:'Total Leads',    value:companyLeads.length,               color:'#0EA5E9', trend:'+14%' },
          { title:'Revenue Won',    value:`₹${(wonValue/1000).toFixed(0)}K`, color:'#10B981', trend:'+22%' },
          { title:'Pipeline Value', value:`₹${(pipelineValue/1000).toFixed(0)}K`, color:'#6366F1', trend:'+8%' },
          { title:'Win Rate',       value:`${winRate}%`,                     color:'#A855F7', trend: winRate >= 20 ? '+3%' : '-2%' },
          { title:'Task Completion',value:`${taskCompletion}%`,              color:'#F59E0B', trend:'+5%' },
        ].map(k => (
          <div key={k.title} className="card" style={{ padding:'12px 14px' }}>
            <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:6 }}>{k.title}</p>
            <p style={{ fontSize:22, fontWeight:700, color:k.color, marginBottom:4 }}>{k.value}</p>
            <span style={{ fontSize:10, fontWeight:700, color:k.trend.startsWith('+') ? '#10B981' : '#EF4444' }}>{k.trend} vs last period</span>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:4, marginBottom:14, padding:4, borderRadius:12, background:'var(--bg-secondary)', border:'1px solid var(--border-primary)', width:'fit-content' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                background: activeTab===tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab===tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                border: activeTab===tab.id ? '1px solid var(--border-primary)' : '1px solid transparent' }}>
              <Icon size={12} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Row 1: Revenue + Conversion */}
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:14 }}>
            <div className="card p-5">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Revenue Trend</p>
                  <p style={{ fontSize:11, color:'var(--text-muted)' }}>Monthly revenue won</p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:'#10B981' }}>₹{(wonValue/1000).toFixed(0)}K total</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
                  <Tooltip content={<ChartTip prefix="₹" />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" dot={{ fill:'#10B981', r:3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Lead Funnel */}
            <div className="card p-5">
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Conversion Funnel</p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Lead-to-deal pipeline</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {funnelStages.map((s, i) => (
                  <div key={s.label} style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <span style={{ fontSize:10, color:'var(--text-muted)', width:80, flexShrink:0, textAlign:'right' }}>{s.label}</span>
                    <div style={{ flex:1, height:18, borderRadius:4, background:'var(--bg-secondary)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${(s.value/funnelMax)*100}%`, background:s.color, borderRadius:4, display:'flex', alignItems:'center', paddingLeft:6, transition:'width 0.5s' }}>
                        {s.value > 0 && <span style={{ fontSize:9, fontWeight:800, color:'white' }}>{s.value}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, color:s.color, width:30, textAlign:'right' }}>{funnelMax > 0 ? Math.round((s.value/funnelMax)*100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Deal stages + Lead status */}
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:14 }}>
            <div className="card p-5">
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Deal Pipeline Stage Distribution</p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Deals by stage</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stageData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
                  <XAxis dataKey="stage" tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {stageData.map((entry, i) => (
                      <Cell key={i} fill={['#0EA5E9','#6366F1','#F59E0B','#A855F7','#10B981','#EF4444'][i] || '#64748B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lead status donut */}
            <div className="card p-5">
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Lead Status Mix</p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:10 }}>Distribution across stages</p>
              {leadStatuses.length > 0 ? (
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <ResponsiveContainer width="50%" height={140}>
                    <PieChart>
                      <Pie data={leadStatuses} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value">
                        {leadStatuses.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                    {leadStatuses.map(s => (
                      <div key={s.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:s.color }} />
                          <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{s.name}</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize:12, color:'var(--text-muted)', textAlign:'center', padding:24 }}>No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Team chart */}
          {teamData.length > 0 && (
            <div className="card p-5">
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Team Revenue Leaderboard</p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Revenue won per sales rep</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={teamData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
                  <Tooltip content={<ChartTip prefix="₹" />} />
                  <Bar dataKey="value" fill="#6366F1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Team table */}
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border-primary)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Team Performance Details</p>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>{teamData.length} reps</span>
            </div>
            {teamData.length === 0 ? (
              <div style={{ padding:40, textAlign:'center' }}>
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>No sales team members found</p>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Rep</th><th>Role</th><th>Leads</th><th>Deals Won</th><th>Revenue Won</th><th>Performance</th></tr></thead>
                  <tbody>
                    {teamData.map((rep, i) => {
                      const maxVal = teamData[0]?.value || 1;
                      return (
                        <tr key={rep.name}>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg, #0EA5E9, #6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white' }}>
                                {rep.name[0]}
                              </div>
                              <div>
                                <p style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                                  {i === 0 && '🏆 '}{rep.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'rgba(99,102,241,0.1)', color:'#6366F1', textTransform:'capitalize' }}>{rep.role}</span></td>
                          <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{rep.leads}</td>
                          <td style={{ fontWeight:700, color:'#10B981' }}>{rep.deals}</td>
                          <td><span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'#10B981' }}>₹{rep.value.toLocaleString()}</span></td>
                          <td>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ flex:1, height:6, borderRadius:3, background:'var(--border-primary)', minWidth:80 }}>
                                <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg, #0EA5E9, #6366F1)', width:`${(rep.value/maxVal)*100}%`, transition:'width 0.5s' }} />
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, color:'#0EA5E9', width:32 }}>{Math.round((rep.value/maxVal)*100)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sources' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Source bar chart */}
          {sourceData.length > 0 && (
            <div className="card p-5">
              <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Lead Volume by Source</p>
              <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Where your leads are coming from</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sourceData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={['#0EA5E9','#6366F1','#F59E0B','#10B981','#A855F7','#EC4899','#14B8A6'][i % 7]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Source cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
            {(sourceData.length > 0 ? sourceData : LEAD_SOURCE_DATA.map(s => ({ name:s.name, count:s.value, pct:s.value }))).map((s, i) => {
              const color = ['#0EA5E9','#6366F1','#F59E0B','#10B981','#A855F7','#EC4899','#14B8A6'][i % 7];
              return (
                <div key={s.name} className="card" style={{ padding:'14px 16px', borderTop:`3px solid ${color}` }}>
                  <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>{s.name}</p>
                  <p style={{ fontSize:24, fontWeight:700, color, marginBottom:6 }}>{s.count}</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ flex:1, height:4, borderRadius:2, background:'var(--border-primary)', marginRight:8 }}>
                      <div style={{ height:'100%', borderRadius:2, background:color, width:`${s.pct}%` }} />
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, color }}>{s.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversion by source */}
          <div className="card p-5">
            <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:2 }}>Conversion Rate by Source</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14 }}>Which sources convert best to closed deals</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={CONVERSION_DATA}>
                <defs>
                  <linearGradient id="convGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="rate" stroke="#A855F7" strokeWidth={2} fill="url(#convGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
