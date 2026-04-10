import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common';
import {
  Users, TrendingUp, Layers, CheckSquare, ArrowRight, Target,
  DollarSign, BarChart2, Award, Activity, Zap, Phone, Mail,
  ArrowUpRight, Building2, Clock, ChevronRight, Briefcase,
  UserCheck, ShieldCheck, Settings,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';

const ChartTip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#0EA5E9', fontSize: 13, fontWeight: 700 }}>
            {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('value') ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ROLE_COLORS = {
  company_admin: '#A855F7', manager: '#0EA5E9', sales: '#F59E0B',
  support: '#6366F1', finance: '#10B981', marketing: '#EC4899',
  hr: '#8B5CF6', operations: '#14B8A6', customer_success: '#F97316', legal: '#64748B',
};

const DEPT_PIE_COLORS = ['#0EA5E9', '#F59E0B', '#6366F1', '#10B981', '#EC4899', '#A855F7', '#14B8A6', '#F97316'];

export default function CADashboard() {
  const { currentUser, currentCompany, leads, deals, tasks, users } = useAuth();
  const navigate = useNavigate();
  const [activeQuick, setActiveQuick] = useState(null);

  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id);
  const companyTasks = tasks.filter(t => t.companyId === currentCompany?.id);

  const totalDealValue = companyDeals.reduce((s, d) => s + (d.value || 0), 0);
  const wonDeals = companyDeals.filter(d => d.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pendingTasks = companyTasks.filter(t => t.status === 'pending').length;
  const activeUsers = companyUsers.filter(u => u.status === 'active').length;
  const winRate = companyDeals.length ? Math.round((wonDeals.length / companyDeals.length) * 100) : 0;

  // Lead funnel
  const leadFunnel = [
    { stage: 'New',       count: companyLeads.filter(l => l.status === 'new').length,       color: '#0EA5E9' },
    { stage: 'Contacted', count: companyLeads.filter(l => l.status === 'contacted').length,  color: '#6366F1' },
    { stage: 'Qualified', count: companyLeads.filter(l => l.status === 'qualified').length,  color: '#F59E0B' },
    { stage: 'Proposal',  count: companyLeads.filter(l => l.status === 'proposal').length,   color: '#A855F7' },
    { stage: 'Lost',      count: companyLeads.filter(l => l.status === 'lost').length,       color: '#EF4444' },
  ];

  // Department distribution for donut
  const deptGroups = companyUsers.reduce((acc, u) => {
    const dept = u.department || 'Other';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const deptPie = Object.entries(deptGroups).map(([name, value], i) => ({
    name, value, color: DEPT_PIE_COLORS[i % DEPT_PIE_COLORS.length]
  }));

  // Role distribution
  const roleGroups = companyUsers
    .filter(u => u.role !== 'company_admin')
    .reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  // Team performance (sales + manager)
  const salesUsers = companyUsers.filter(u => ['sales', 'manager'].includes(u.role));
  const teamPerf = salesUsers.map(u => ({
    name: u.name.split(' ')[0],
    leads: leads.filter(l => l.assignedTo === u.id).length,
    deals: deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').length,
  }));

  // Revenue trend (mock weekly)
  const revTrend = [
    { week: 'W1', value: Math.round(wonValue * 0.1) },
    { week: 'W2', value: Math.round(wonValue * 0.25) },
    { week: 'W3', value: Math.round(wonValue * 0.5) },
    { week: 'W4', value: Math.round(wonValue * 0.75) },
    { week: 'W5', value: wonValue },
  ];

  const recentLeads = [...companyLeads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const QUICK_ACTIONS = [
    { label: 'Manage Employees',   path: '/company/employees',  color: '#0EA5E9', icon: Users },
    { label: 'View Leads',         path: '/company/leads',      color: '#6366F1', icon: TrendingUp },
    { label: 'Deal Pipeline',      path: '/company/deals',      color: '#F59E0B', icon: Layers },
    { label: 'Contacts',           path: '/company/contacts',   color: '#10B981', icon: UserCheck },
    { label: 'Payments & Invoices',path: '/company/payments',   color: '#A855F7', icon: DollarSign },
    { label: 'Module Control',     path: '/company/modules',    color: '#EC4899', icon: Zap },
    { label: 'Reports',            path: '/company/reports',    color: '#14B8A6', icon: BarChart2 },
    { label: 'Settings',           path: '/company/settings',   color: '#64748B', icon: Settings },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={14} style={{ color: '#0EA5E9' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0EA5E9' }}>
              {currentCompany?.name} · {currentCompany?.plan?.toUpperCase()} PLAN
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            Company Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentUser?.name}</span>
            &nbsp;·&nbsp;{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/company/reports')} className="btn-secondary" style={{ fontSize: 12 }}>
            <BarChart2 size={13} /> Reports
          </button>
          <button onClick={() => navigate('/company/employees')} className="btn-primary" style={{ fontSize: 12 }}>
            <Users size={13} /> Team
          </button>
        </div>
      </div>

      {/* Row 1: 6 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Team Members',   value: activeUsers,                          sub: `of ${companyUsers.length} total`, color: '#0EA5E9', icon: Users },
          { label: 'Total Leads',    value: companyLeads.length,                  sub: `${companyLeads.filter(l=>l.status==='new').length} new`, color: '#6366F1', icon: TrendingUp, trend: '+14%' },
          { label: 'Deal Pipeline',  value: `₹${(totalDealValue/1000).toFixed(0)}K`, sub: `${companyDeals.length} deals`, color: '#F59E0B', icon: Layers, trend: '+22%' },
          { label: 'Won Revenue',    value: `₹${(wonValue/1000).toFixed(0)}K`,    sub: `${wonDeals.length} closed`, color: '#10B981', icon: Award, trend: '+18%' },
          { label: 'Win Rate',       value: `${winRate}%`,                        sub: 'deals won',   color: '#A855F7', icon: Target },
          { label: 'Pending Tasks',  value: pendingTasks,                         sub: 'action items', color: pendingTasks > 5 ? '#EF4444' : '#64748B', icon: CheckSquare },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{k.label}</p>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{k.value}</p>
              <div className="flex items-center gap-1.5">
                {k.trend && <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 20 }}>↑ {k.trend}</span>}
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Revenue Chart + Department Donut + Lead Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Revenue Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Won — Trend</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Cumulative closed deal value</p>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#10B981' }}>₹{wonValue.toLocaleString()}</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={revTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="value" name="value" stroke="#10B981" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#10B981', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Headcount Donut */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Department Breakdown</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{activeUsers} active across {deptPie.length} departments</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={deptPie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                {deptPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            {deptPie.slice(0, 4).map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: d.color }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Lead Funnel</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{companyLeads.length} total leads</p>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0EA5E9' }}>{winRate}% win</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leadFunnel.filter(s => s.count > 0 || s.stage !== 'Lost').map(s => (
              <div key={s.stage}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.stage}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.count}</span>
                </div>
                <div style={{ height: 5, borderRadius: 4, background: 'var(--border-primary)' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: s.color, width: `${companyLeads.length ? (s.count / companyLeads.length) * 100 : 0}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-primary)' }}>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Won Value</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>₹{(wonValue/1000).toFixed(0)}K</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg Lead Value</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>
                ₹{companyLeads.length ? Math.round(companyLeads.reduce((s,l)=>s+(l.value||0),0)/companyLeads.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Team Performance + Role Breakdown + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Team Performance Chart */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Sales Team Performance</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>Leads assigned vs Deals won</p>
          {teamPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={teamPerf} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="leads" name="Leads" fill="#0EA5E9" radius={[3,3,0,0]} />
                <Bar dataKey="deals" name="Deals Won" fill="#10B981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sales team data yet. Add employees.</p>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            {[{ label: 'Leads', color: '#0EA5E9' }, { label: 'Deals Won', color: '#10B981' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Workforce by Role</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>{companyUsers.length} total team members</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(roleGroups).sort((a, b) => b[1] - a[1]).map(([role, count]) => {
              const color = ROLE_COLORS[role] || '#64748B';
              const maxCount = Math.max(...Object.values(roleGroups));
              return (
                <div key={role}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {role.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color }}>{count}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border-primary)' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: color, width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Quick Actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {QUICK_ACTIONS.map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => navigate(a.path)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px',
                    borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: `${a.color}0F`, color: a.color, border: `1px solid ${a.color}20` }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${a.color}1A`; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${a.color}0F`; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon size={12} /> {a.label}
                  </span>
                  <ArrowRight size={11} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Leads Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Leads</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Latest inbound leads across all sources</p>
          </div>
          <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => navigate('/company/leads')}>
            View All <ArrowRight size={11} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Lead</th><th>Source</th><th>Value</th><th>Status</th><th>Priority</th><th>Last Contact</th><th>Action</th></tr>
            </thead>
            <tbody>
              {recentLeads.map(l => (
                <tr key={l.id}>
                  <td>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{l.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.contact}</p>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {l.source}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10B981' }}>₹{l.value?.toLocaleString()}</span></td>
                  <td><Badge value={l.status} /></td>
                  <td><Badge value={l.priority} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.lastContact}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <a href={`tel:${l.phone}`} style={{ padding: 5, borderRadius: 7, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex' }}><Phone size={12} /></a>
                      <a href={`mailto:${l.email}`} style={{ padding: 5, borderRadius: 7, background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', display: 'flex' }}><Mail size={12} /></a>
                    </div>
                  </td>
                </tr>
              ))}
              {recentLeads.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>No leads yet. Start adding leads!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
