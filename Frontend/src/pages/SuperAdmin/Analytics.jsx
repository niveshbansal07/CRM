import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatCard } from '../../components/common';
import { REVENUE_DATA, CONVERSION_DATA, LEAD_SOURCE_DATA } from '../../data/mockData';
import { DollarSign, Building2, Users, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: '#111827', border: '1px solid #1E2D45' }}>
        <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-700" style={{ color: p.color }}>
            {typeof p.value === 'number' && p.name === 'revenue' ? `₹${p.value.toLocaleString()}` : p.value}
            {p.name === 'rate' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SAAnalytics() {
  const { companies, users, leads, deals } = useAuth();

  const totalRevenue = companies.reduce((s, c) => s + (c.revenue || 0), 0);
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalLeads = companies.reduce((s, c) => s + (c.leads || 0), 0);

  // Company growth mock data
  const companyGrowth = [
    { month: 'Aug', companies: 1 },
    { month: 'Sep', companies: 2 },
    { month: 'Oct', companies: 3 },
    { month: 'Nov', companies: 3 },
    { month: 'Dec', companies: 4 },
    { month: 'Jan', companies: companies.length },
  ];

  const industryDist = [...new Set(companies.map(c => c.industry))].map(ind => ({
    name: ind,
    count: companies.filter(c => c.industry === ind).length,
  })).sort((a, b) => b.count - a.count);

  const INDUSTRY_COLORS = ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#A855F7', '#EF4444'];

  return (
    <div className="page-enter">
      <PageHeader title="Platform Analytics" subtitle="Deep-dive metrics across the entire platform" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total MRR" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} accentColor="#10B981" trend={23} trendLabel="vs last month" />
        <StatCard title="Active Companies" value={activeCompanies} subtitle={`of ${companies.length} total`} icon={Building2} accentColor="#0EA5E9" trend={12} />
        <StatCard title="Platform Users" value={users.length} icon={Users} accentColor="#6366F1" trend={8} />
        <StatCard title="Total Leads" value={totalLeads.toLocaleString()} icon={TrendingUp} accentColor="#F59E0B" trend={15} />
      </div>

      {/* Revenue + Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Monthly Recurring Revenue</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Platform-wide subscription revenue trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Lead Conversion Rate</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Average conversion rate across companies</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CONVERSION_DATA}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="rate" stroke="#A855F7" strokeWidth={2.5} dot={{ fill: '#A855F7', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Company Growth + Industry + Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Company Onboarding</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>New companies per month</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={companyGrowth}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="companies" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Lead Sources</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Where leads come from</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={LEAD_SOURCE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {LEAD_SOURCE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {LEAD_SOURCE_DATA.map(s => (
              <div key={s.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.name} {s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="text-sm font-700 mb-3" style={{ color: 'var(--text-primary)' }}>Industry Breakdown</p>
          <div className="flex flex-col gap-2.5">
            {industryDist.map((ind, i) => (
              <div key={ind.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{ind.name}</span>
                  <span className="text-xs font-700" style={{ color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length] }}>{ind.count}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--border-primary)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(ind.count / companies.length) * 100}%`,
                    background: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>ARR Projection</p>
            <p className="font-display font-700 text-2xl" style={{ color: '#10B981' }}>
              ₹{(totalRevenue * 12).toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Based on current MRR</p>
          </div>
        </div>
      </div>
    </div>
  );
}
