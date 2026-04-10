import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge } from '../../components/common';
import { REVENUE_DATA, REVENUE_BY_COMPANY, SIGNUP_TREND, CONVERSION_DATA } from '../../data/mockData';
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Building2, Download, Calendar, Target, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#10B981', fontSize: 13, fontWeight: 700 }}>
            {p.name}: {typeof p.value === 'number' ? `₹${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PLAN_COLORS = { enterprise: '#A855F7', pro: '#0EA5E9', free: '#334155' };

export default function SARevenue() {
  const { companies, deals } = useAuth();
  const [period, setPeriod] = useState('6m');

  const totalMRR = companies.reduce((s, c) => s + (c.revenue || 0), 0);
  const totalARR = totalMRR * 12;
  const enterpriseMRR = companies.filter(c => c.plan === 'enterprise').reduce((s, c) => s + (c.revenue || 0), 0);
  const proMRR = companies.filter(c => c.plan === 'pro').reduce((s, c) => s + (c.revenue || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);

  // Cohort data (mock)
  const cohortData = [
    { month: 'Aug', newMRR: 2200, expansion: 0,    churn: 0 },
    { month: 'Sep', newMRR: 3200, expansion: 500,  churn: 200 },
    { month: 'Oct', newMRR: 1800, expansion: 800,  churn: 0 },
    { month: 'Nov', newMRR: 0,    expansion: 400,  churn: 1600 },
    { month: 'Dec', newMRR: 1176, expansion: 2800, churn: 0 },
    { month: 'Jan', newMRR: 2400, expansion: 1800, churn: 0 },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Revenue Center" subtitle="MRR / ARR tracking, cohort analysis & company-level revenue breakdown">
        <div className="flex items-center gap-2">
          {['3m', '6m', '1y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: period === p ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: period === p ? '#10B981' : 'var(--text-muted)',
                border: period === p ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-primary)',
              }}>
              {p}
            </button>
          ))}
          <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>
            <Download size={13} /> Export
          </button>
        </div>
      </PageHeader>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Monthly MRR',       value: `₹${totalMRR.toLocaleString()}`,     color: '#10B981', trend: '+23%', icon: DollarSign },
          { label: 'Annual ARR',        value: `₹${(totalARR/1000).toFixed(0)}K`,   color: '#A855F7', trend: '+23%', icon: Target },
          { label: 'Enterprise MRR',    value: `₹${enterpriseMRR.toLocaleString()}`, color: '#A855F7', trend: '+8%',  icon: Building2 },
          { label: 'Pro MRR',           value: `₹${proMRR.toLocaleString()}`,        color: '#0EA5E9', trend: '-2%',  icon: Layers },
          { label: 'Closed Deal Value', value: `₹${(wonValue/1000).toFixed(0)}K`,   color: '#F59E0B', trend: '+18%', icon: TrendingUp },
        ].map(k => {
          const Icon = k.icon;
          const isNeg = k.trend.startsWith('-');
          return (
            <div key={k.label} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{k.label}</p>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color: k.color }} />
                </div>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{k.value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {isNeg
                  ? <ArrowDownRight size={12} style={{ color: '#EF4444' }} />
                  : <ArrowUpRight size={12} style={{ color: '#10B981' }} />}
                <span style={{ fontSize: 11, fontWeight: 700, color: isNeg ? '#EF4444' : '#10B981' }}>{k.trend}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* MRR Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>MRR Growth Trend</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Total platform revenue month-over-month</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>₹{totalMRR.toLocaleString()}</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="MRR" stroke="#10B981" strokeWidth={2.5} fill="url(#mrrGrad)" dot={{ fill: '#10B981', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MRR Cohort (New / Expansion / Churn) */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>MRR Movement</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>New · Expansion · Churn breakdown</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cohortData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="newMRR"    name="New MRR"       fill="#10B981" radius={[3,3,0,0]} />
              <Bar dataKey="expansion" name="Expansion"     fill="#0EA5E9" radius={[3,3,0,0]} />
              <Bar dataKey="churn"     name="Churn (lost)"  fill="#EF4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[{ label: 'New', color: '#10B981' }, { label: 'Expansion', color: '#0EA5E9' }, { label: 'Churn', color: '#EF4444' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Company Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Company Revenue Breakdown</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>MRR per company with growth & plan details</p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>All periods · Live data</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Plan</th>
                <th>MRR</th>
                <th>ARR</th>
                <th>MoM Growth</th>
                <th>Active Deals</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_BY_COMPANY.map((comp, idx) => {
                const company = companies.find(c => c.id === comp.id);
                const isGrowth = comp.growth > 0;
                const isFlat   = comp.growth === 0;
                return (
                  <tr key={comp.id}>
                    <td>
                      <span style={{ fontSize: 14, fontWeight: 700, color: idx < 3 ? ['#F59E0B','#94A3B8','#CD7F32'][idx] : 'var(--text-muted)' }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${PLAN_COLORS[comp.plan]}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: PLAN_COLORS[comp.plan] }}>
                          {comp.name.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{comp.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{company?.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: `${PLAN_COLORS[comp.plan]}18`, color: PLAN_COLORS[comp.plan], textTransform: 'uppercase' }}>
                        {comp.plan}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#10B981' }}>
                        {comp.mrr > 0 ? `₹${comp.mrr.toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {comp.mrr > 0 ? `₹${(comp.mrr * 12).toLocaleString()}` : '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isFlat
                          ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          : isGrowth
                          ? <><ArrowUpRight size={13} style={{ color: '#10B981' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>+{comp.growth}%</span></>
                          : <><ArrowDownRight size={13} style={{ color: '#EF4444' }} />
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>{comp.growth}%</span></>
                        }
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{comp.deals}</span>
                    </td>
                    <td>
                      <Badge value={company?.status || 'inactive'} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {REVENUE_BY_COMPANY.length} companies</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>
            Total MRR: ₹{totalMRR.toLocaleString()} · ARR: ₹{totalARR.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
