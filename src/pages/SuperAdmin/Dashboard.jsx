import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Badge } from '../../components/common';
import {
  Building2, Users, DollarSign, TrendingUp, AlertTriangle, Zap,
  ArrowRight, ArrowUpRight, ArrowDownRight, Activity, Shield,
  Bell, CheckCircle, BarChart2, Globe, RefreshCw, Plus,
  ChevronRight, Wifi, Server, Eye
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import {
  REVENUE_DATA, SIGNUP_TREND, COMPANY_HEALTH, CHURN_RISK,
  PLATFORM_ALERTS, REVENUE_BY_COMPANY, MODULE_USAGE, PLATFORM_HEALTH
} from '../../data/mockData';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#0EA5E9', fontSize: 13, fontWeight: 700 }}>
            {p.name === 'revenue' || p.name === 'mrr' ? `₹${Number(p.value).toLocaleString()}` : p.value}
            {p.name === 'sessions' ? ' sessions' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
const Sparkline = ({ data, dataKey, color }) => (
  <ResponsiveContainer width="100%" height={40}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
          <stop offset="95%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5}
        fill={`url(#spark-${color.replace('#','')})`} dot={false} />
    </AreaChart>
  </ResponsiveContainer>
);

// ─── Health Ring ──────────────────────────────────────────────────────────────
const HealthRing = ({ score }) => {
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: 48, height: 48 }}>
      <svg viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#1E2D45" strokeWidth="4" />
        <circle cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          strokeLinecap="round" transform="rotate(-90 24 24)" />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700, color }}>{score}</span>
    </div>
  );
};

// ─── Alert Icon ───────────────────────────────────────────────────────────────
const AlertDot = ({ type }) => {
  const colors = { warning: '#F59E0B', info: '#0EA5E9', success: '#10B981', danger: '#EF4444' };
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors[type] || '#64748B', display: 'inline-block', flexShrink: 0, marginTop: 4 }} />;
};

// ─── Plan Colors ─────────────────────────────────────────────────────────────
const PLAN_COLORS = { free: '#64748B', pro: '#0EA5E9', enterprise: '#A855F7' };
const RISK_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: 'Critical' },
  medium:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: 'Medium' },
  low:      { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: 'Low' },
};

const PLAN_PIE = [
  { name: 'Enterprise', value: 2, color: '#A855F7' },
  { name: 'Pro',        value: 2, color: '#0EA5E9' },
  { name: 'Free',       value: 1, color: '#334155' },
];

export default function SADashboard() {
  const { companies, users, leads, deals } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const now = new Date();

  // ── Computed KPIs ────────────────────────────────────────────────────────────
  const totalMRR = companies.reduce((s, c) => s + (c.revenue || 0), 0);
  const totalARR = totalMRR * 12;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const inactiveCompanies = companies.filter(c => c.status === 'inactive').length;
  const totalUsers = users.length;
  const totalLeads = companies.reduce((s, c) => s + (c.leads || 0), 0);
  const enterpriseCount = companies.filter(c => c.plan === 'enterprise').length;
  const proCount = companies.filter(c => c.plan === 'pro').length;
  const churnAtRisk = CHURN_RISK.filter(r => r.risk === 'critical' || r.risk === 'medium').length;
  const totalDeals = deals.length;
  const wonDeals = deals.filter(d => d.stage === 'Closed Won').length;

  return (
    <div className="page-enter" style={{ maxWidth: '100%' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A855F7' }}>
              TRACKFIELD PLATFORM
            </span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>LIVE</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em', fontFamily: "'DM Sans', sans-serif" }}>
            Super Admin Command Center
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;Platform Uptime: <span style={{ color: '#10B981', fontWeight: 700 }}>{PLATFORM_HEALTH.uptime}%</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/admin/revenue')}
            className="btn-secondary" style={{ fontSize: 13 }}>
            <BarChart2 size={14} /> Revenue
          </button>
          <button onClick={() => navigate('/admin/system')}
            className="btn-secondary" style={{ fontSize: 13 }}>
            <Server size={14} /> System Health
          </button>
          <button onClick={() => navigate('/admin/companies')}
            className="btn-primary" style={{ fontSize: 13 }}>
            <Plus size={14} /> Add Company
          </button>
        </div>
      </div>

      {/* ── Row 1: 6 KPI Cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 20 }}>

        {/* MRR */}
        <div className="card stat-card p-4" style={{ '--accent-color': '#10B981' }}>
          <div className="flex items-start justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Monthly MRR</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={15} style={{ color: '#10B981' }} />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            ₹{(totalMRR / 1000).toFixed(1)}K
          </p>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 20 }}>↑ 23%</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>vs last mo</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline data={REVENUE_DATA} dataKey="revenue" color="#10B981" />
          </div>
        </div>

        {/* Companies */}
        <div className="card stat-card p-4" style={{ '--accent-color': '#0EA5E9' }}>
          <div className="flex items-start justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Companies</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(14,165,233,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={15} style={{ color: '#0EA5E9' }} />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{activeCompanies}</p>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Active of</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{companies.length}</span>
            {inactiveCompanies > 0 && <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>· {inactiveCompanies} off</span>}
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline data={SIGNUP_TREND} dataKey="companies" color="#0EA5E9" />
          </div>
        </div>

        {/* Users */}
        <div className="card stat-card p-4" style={{ '--accent-color': '#6366F1' }}>
          <div className="flex items-start justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Platform Users</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={15} style={{ color: '#6366F1' }} />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{totalUsers}</p>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 20 }}>↑ 8%</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>this week</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline data={SIGNUP_TREND} dataKey="users" color="#6366F1" />
          </div>
        </div>

        {/* Total Leads */}
        <div className="card stat-card p-4" style={{ '--accent-color': '#F59E0B' }}>
          <div className="flex items-start justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Platform Leads</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} style={{ color: '#F59E0B' }} />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{totalLeads.toLocaleString()}</p>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 20 }}>↑ 15%</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>this month</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline data={REVENUE_DATA} dataKey="pro" color="#F59E0B" />
          </div>
        </div>

        {/* Churn Risk */}
        <div className="card stat-card p-4" style={{ '--accent-color': '#EF4444' }}>
          <div className="flex items-start justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Churn Risk</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={15} style={{ color: '#EF4444' }} />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: churnAtRisk > 0 ? '#EF4444' : '#10B981', marginBottom: 4 }}>{churnAtRisk}</p>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              {churnAtRisk === 0 ? 'All accounts healthy' : 'companies at risk'}
            </span>
          </div>
          <button onClick={() => navigate('/admin/companies')}
            style={{ marginTop: 12, fontSize: 10, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>
            View Watchlist →
          </button>
        </div>

        {/* ARR */}
        <div className="card stat-card p-4" style={{ '--accent-color': '#A855F7' }}>
          <div className="flex items-start justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Annual ARR</p>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168,85,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} style={{ color: '#A855F7' }} />
            </div>
          </div>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#A855F7', marginBottom: 4 }}>
            ₹{(totalARR / 1000).toFixed(1)}K
          </p>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Projected run rate</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Sparkline data={REVENUE_DATA} dataKey="enterprise" color="#A855F7" />
          </div>
        </div>
      </div>

      {/* ── Row 2: Revenue Intelligence ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* MRR + Plan Stacked Chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Intelligence</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>MRR by plan tier — 6-month trend</p>
            </div>
            <div className="flex items-center gap-4">
              {[{ label: 'Enterprise', color: '#A855F7' }, { label: 'Pro', color: '#0EA5E9' }].map(p => (
                <div key={p.label} className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="enterprise" name="enterprise" stackId="a" fill="#A855F7" radius={[0,0,0,0]} />
              <Bar dataKey="pro" name="pro" stackId="a" fill="#0EA5E9" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total MRR</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#10B981' }}>₹{totalMRR.toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Enterprise ratio</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#A855F7' }}>
                {Math.round((enterpriseCount / companies.length) * 100)}%
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deal Win Rate</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#0EA5E9' }}>
                {totalDeals ? Math.round((wonDeals / totalDeals) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Plan Distribution + Growth */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Plan Distribution</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Active subscriptions by tier</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={PLAN_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {PLAN_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2D45', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {PLAN_PIE.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.value} co.</span>
                  <div style={{ width: 60, height: 4, borderRadius: 4, background: 'var(--border-primary)' }}>
                    <div style={{ width: `${(p.value / companies.length) * 100}%`, height: '100%', borderRadius: 4, background: p.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Company Health + Activity ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Company Health Matrix */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Company Health Matrix</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Real-time health scores & activity</p>
            </div>
            <button onClick={() => navigate('/admin/companies')}
              className="btn-secondary" style={{ fontSize: 11, padding: '5px 12px' }}>
              Manage All <ChevronRight size={11} />
            </button>
          </div>
          <div>
            {companies.map(c => {
              const health = COMPANY_HEALTH.find(h => h.companyId === c.id) || {};
              const score = health.healthScore || 0;
              const scoreColor = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
              return (
                <div key={c.id} className="flex items-center gap-4 px-5 py-3 transition-colors"
                  style={{ borderBottom: '1px solid rgba(30,45,69,0.5)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                  {/* Health Ring */}
                  <HealthRing score={score} />

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</p>
                      <Badge value={c.status} />
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {health.activityToday || 0} events today · {health.logins7d || 0} logins/7d
                    </p>
                  </div>

                  {/* Module bar */}
                  <div style={{ width: 80, textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{health.moduleUsage || 0}/12 modules</p>
                    <div style={{ height: 3, borderRadius: 4, background: 'var(--border-primary)' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: scoreColor, width: `${((health.moduleUsage || 0) / 12) * 100}%` }} />
                    </div>
                  </div>

                  {/* Plan badge */}
                  <div style={{ minWidth: 80, textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
                      background: `${PLAN_COLORS[c.plan]}18`, color: PLAN_COLORS[c.plan] }}>
                      {c.plan}
                    </span>
                    <p style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 3 }}>
                      ₹{(c.revenue || 0).toLocaleString()}/mo
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Alerts + Activity Feed */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: '#F59E0B' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Platform Alerts</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>LIVE</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {PLATFORM_ALERTS.map(alert => (
              <div key={alert.id} className="flex items-start gap-3 px-5 py-3 transition-colors"
                style={{ borderBottom: '1px solid rgba(30,45,69,0.4)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <AlertDot type={alert.type} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{alert.message}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <button onClick={() => navigate('/admin/activity-log')}
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              View Full Activity Log <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 4: Revenue Table + Churn Watchlist ──────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Top Companies by Revenue */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Top Companies · Revenue</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Ranked by MRR with growth indicator</p>
          </div>
          <div>
            {REVENUE_BY_COMPANY.map((comp, idx) => (
              <div key={comp.id} className="flex items-center gap-3 px-5 py-3 transition-colors"
                style={{ borderBottom: idx < REVENUE_BY_COMPANY.length - 1 ? '1px solid rgba(30,45,69,0.5)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', width: 16 }}>{idx + 1}</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${PLAN_COLORS[comp.plan]}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: PLAN_COLORS[comp.plan] }}>
                  {comp.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{comp.deals} active deals</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>
                    {comp.mrr > 0 ? `₹${comp.mrr.toLocaleString()}` : '—'}
                  </p>
                  <div className="flex items-center gap-0.5 justify-end mt-0.5">
                    {comp.growth > 0
                      ? <><ArrowUpRight size={10} style={{ color: '#10B981' }} /><span style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>+{comp.growth}%</span></>
                      : comp.growth < 0
                      ? <><ArrowDownRight size={10} style={{ color: '#EF4444' }} /><span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>{comp.growth}%</span></>
                      : <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk Watchlist */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Churn Risk Watchlist</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Accounts requiring immediate action</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
              {CHURN_RISK.length} at risk
            </span>
          </div>
          <div>
            {CHURN_RISK.map(risk => {
              const company = companies.find(c => c.id === risk.companyId);
              const conf = RISK_CONFIG[risk.risk];
              return (
                <div key={risk.companyId} className="px-5 py-4 transition-colors"
                  style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: conf.bg, color: conf.color }}>{conf.label} Risk</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {company?.name || risk.companyId}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: conf.color }}>Score: {risk.score}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{risk.reason}</p>
                  {/* Risk Score Bar */}
                  <div style={{ height: 3, borderRadius: 4, background: 'var(--border-primary)' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: conf.color, width: `${risk.score}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      background: conf.bg, color: conf.color, border: `1px solid ${conf.color}30` }}>
                      Contact Admin
                    </button>
                    <button onClick={() => navigate('/admin/companies')}
                      style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}>
                      View Company
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {CHURN_RISK.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle size={32} style={{ color: '#10B981', marginBottom: 8 }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>All Accounts Healthy</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No churn risk detected</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 5: Module Usage + Quick Actions ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

        {/* Module Usage Heatmap */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Module Adoption Heatmap</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>Usage rate across all active companies</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {MODULE_USAGE.map(m => {
              const rate = m.usageRate;
              const bg = rate === 100 ? 'rgba(16,185,129,0.15)' : rate >= 60 ? 'rgba(14,165,233,0.12)' : 'rgba(100,116,139,0.08)';
              const color = rate === 100 ? '#10B981' : rate >= 60 ? '#0EA5E9' : '#475569';
              return (
                <div key={m.module} style={{ background: bg, border: `1px solid ${color}20`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 2 }}>{rate}%</p>
                  <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.module}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Quick Actions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Onboard New Company',     path: '/admin/companies',   color: '#0EA5E9', icon: Building2 },
              { label: 'Manage Subscription Plans', path: '/admin/plans',     color: '#A855F7', icon: Zap },
              { label: 'View All Users',           path: '/admin/users',      color: '#6366F1', icon: Users },
              { label: 'Revenue Dashboard',        path: '/admin/revenue',    color: '#10B981', icon: DollarSign },
              { label: 'System Health Monitor',    path: '/admin/system',     color: '#F59E0B', icon: Server },
              { label: 'Platform Analytics',       path: '/admin/analytics',  color: '#0EA5E9', icon: BarChart2 },
              { label: 'Full Activity Audit Log',  path: '/admin/activity-log', color: '#64748B', icon: Activity },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: `${a.color}0F`, color: a.color, border: `1px solid ${a.color}20`, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${a.color}1A`; e.currentTarget.style.transform = 'translateX(2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${a.color}0F`; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} />
                    <span style={{ fontSize: 12 }}>{a.label}</span>
                  </span>
                  <ArrowRight size={12} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
