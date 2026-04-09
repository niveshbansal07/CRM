import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, StatCard } from '../../components/common';
import { REVENUE_DATA, CONVERSION_DATA, LEAD_SOURCE_DATA } from '../../data/mockData';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: '#111827', border: '1px solid #1E2D45' }}>
        <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
        <p className="text-sm font-700" style={{ color: '#0EA5E9' }}>{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function CAReports() {
  const { currentCompany, leads, deals, tasks, users } = useAuth();

  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id);
  const companyTasks = tasks.filter(t => t.companyId === currentCompany?.id);

  const wonDeals = companyDeals.filter(d => d.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const winRate = companyDeals.length ? Math.round((wonDeals.length / companyDeals.length) * 100) : 0;
  const completedTasks = companyTasks.filter(t => t.status === 'completed').length;
  const taskCompletion = companyTasks.length ? Math.round((completedTasks / companyTasks.length) * 100) : 0;

  // Lead status dist
  const leadStatuses = ['new','contacted','qualified','proposal','lost'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: companyLeads.filter(l => l.status === s).length,
    color: { new:'#0EA5E9', contacted:'#6366F1', qualified:'#F59E0B', proposal:'#A855F7', lost:'#EF4444' }[s],
  })).filter(s => s.value > 0);

  // Team performance
  const salesTeam = companyUsers.filter(u => ['sales','manager'].includes(u.role));
  const teamData = salesTeam.map(u => ({
    name: u.name.split(' ')[0],
    leads: leads.filter(l => l.assignedTo === u.id).length,
    deals: deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').length,
    value: deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0),
  }));

  return (
    <div className="page-enter">
      <PageHeader title="Reports & Analytics" subtitle="Performance insights for your team" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Leads" value={companyLeads.length} icon={TrendingUp} accentColor="#0EA5E9" trend={14} />
        <StatCard title="Revenue Won" value={`₹${(wonValue/1000).toFixed(0)}K`} icon={DollarSign} accentColor="#10B981" trend={22} />
        <StatCard title="Win Rate" value={`${winRate}%`} icon={Target} accentColor="#A855F7" />
        <StatCard title="Task Completion" value={`${taskCompletion}%`} icon={Users} accentColor="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Lead Conversion Trend */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Conversion Rate Trend</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Monthly lead-to-deal conversion</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CONVERSION_DATA}>
              <defs>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#A855F7" strokeWidth={2} fill="url(#convGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Status Distribution */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Lead Status Breakdown</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Current distribution across pipeline</p>
          {leadStatuses.length > 0 ? (
            <div className="flex gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={leadStatuses} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {leadStatuses.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 flex flex-col justify-center gap-2">
                {leadStatuses.map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}></div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                    </div>
                    <span className="text-xs font-700" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No lead data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Performance Table */}
      {teamData.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Team Performance</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Rep</th><th>Leads Assigned</th><th>Deals Won</th><th>Revenue Won</th><th>Performance</th></tr></thead>
              <tbody>
                {teamData.sort((a,b) => b.value - a.value).map((rep, i) => {
                  const maxValue = Math.max(...teamData.map(r => r.value)) || 1;
                  return (
                    <tr key={rep.name}>
                      <td>
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-sm">🏆</span>}
                          <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{rep.name}</p>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rep.leads}</td>
                      <td style={{ fontWeight: 600, color: '#10B981' }}>{rep.deals}</td>
                      <td><span className="font-mono text-xs font-700" style={{ color: '#10B981' }}>₹{rep.value.toLocaleString()}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full flex-1" style={{ background: 'var(--border-primary)', minWidth: 80 }}>
                            <div className="h-full rounded-full" style={{ width: `${(rep.value/maxValue)*100}%`, background: 'linear-gradient(90deg, #0EA5E9, #6366F1)' }}></div>
                          </div>
                          <span className="text-xs font-600" style={{ color: '#0EA5E9' }}>{Math.round((rep.value/maxValue)*100)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Sources */}
      <div className="card p-5">
        <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Lead Sources</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {LEAD_SOURCE_DATA.map(s => (
            <div key={s.name} className="rounded-xl p-3 text-center" style={{ background: `${s.color}0A`, border: `1px solid ${s.color}20` }}>
              <p className="font-display font-700 text-2xl mb-0.5" style={{ color: s.color }}>{s.value}%</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
