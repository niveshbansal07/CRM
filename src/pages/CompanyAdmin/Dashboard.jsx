import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Badge } from '../../components/common';
import { Users, TrendingUp, Layers, CheckSquare, ArrowRight, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { REVENUE_DATA, CONVERSION_DATA } from '../../data/mockData';

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

export default function CADashboard() {
  const { currentUser, currentCompany, leads, deals, tasks, users } = useAuth();
  const navigate = useNavigate();

  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyUsers = users.filter(u => u.companyId === currentCompany?.id);
  const companyTasks = tasks.filter(t => t.companyId === currentCompany?.id);

  const totalDealValue = companyDeals.reduce((s, d) => s + (d.value || 0), 0);
  const wonDeals = companyDeals.filter(d => d.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pendingTasks = companyTasks.filter(t => t.status === 'pending').length;

  // Lead funnel data
  const leadFunnel = [
    { stage: 'New', count: companyLeads.filter(l => l.status === 'new').length, color: '#0EA5E9' },
    { stage: 'Contacted', count: companyLeads.filter(l => l.status === 'contacted').length, color: '#6366F1' },
    { stage: 'Qualified', count: companyLeads.filter(l => l.status === 'qualified').length, color: '#F59E0B' },
    { stage: 'Proposal', count: companyLeads.filter(l => l.status === 'proposal').length, color: '#A855F7' },
  ];

  // Team performance
  const salesUsers = companyUsers.filter(u => ['sales', 'manager'].includes(u.role));
  const teamPerf = salesUsers.map(u => ({
    name: u.name.split(' ')[0],
    leads: leads.filter(l => l.assignedTo === u.id).length,
    deals: deals.filter(d => d.assignedTo === u.id).length,
  }));

  const recentLeads = [...companyLeads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="page-enter">
      <div className="mb-6">
        <p className="text-xs font-700 uppercase tracking-widest mb-1" style={{ color: '#0EA5E9' }}>
          {currentCompany?.name}
        </p>
        <h1 className="font-display font-700 text-3xl tracking-wide" style={{ color: 'var(--text-primary)' }}>
          Company Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Welcome back, {currentUser?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Team Members" value={companyUsers.length} subtitle="active employees" icon={Users} accentColor="#0EA5E9" />
        <StatCard title="Total Leads" value={companyLeads.length} subtitle={`${companyLeads.filter(l=>l.status==='new').length} new`} icon={TrendingUp} accentColor="#6366F1" trend={14} />
        <StatCard title="Pipeline Value" value={`₹${(totalDealValue/1000).toFixed(0)}K`} subtitle={`${companyDeals.length} deals`} icon={Layers} accentColor="#F59E0B" trend={22} />
        <StatCard title="Pending Tasks" value={pendingTasks} subtitle="need attention" icon={CheckSquare} accentColor={pendingTasks > 5 ? '#EF4444' : '#10B981'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Lead funnel */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Lead Funnel</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Current pipeline status</p>
          <div className="flex flex-col gap-3">
            {leadFunnel.map((s, i) => (
              <div key={s.stage}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{s.stage}</span>
                  <span className="text-xs font-700" style={{ color: s.color }}>{s.count}</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: 'var(--border-primary)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${companyLeads.length ? (s.count / companyLeads.length) * 100 : 0}%`, background: s.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 flex justify-between" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Won Value</p>
              <p className="font-700 text-base" style={{ color: '#10B981' }}>₹{(wonValue/1000).toFixed(0)}K</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Win Rate</p>
              <p className="font-700 text-base" style={{ color: '#0EA5E9' }}>
                {companyDeals.length ? Math.round((wonDeals.length / companyDeals.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Team Performance</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Leads & deals per member</p>
          {teamPerf.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={teamPerf} barGap={4}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="leads" name="Leads" fill="#0EA5E9" radius={[3,3,0,0]} />
                <Bar dataKey="deals" name="Deals" fill="#6366F1" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No team data yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Add Employee', path: '/company/employees', color: '#0EA5E9', icon: Users },
              { label: 'View Leads', path: '/company/leads', color: '#6366F1', icon: TrendingUp },
              { label: 'Manage Deals', path: '/company/deals', color: '#F59E0B', icon: Layers },
              { label: 'Module Control', path: '/company/modules', color: '#A855F7', icon: Target },
              { label: 'View Reports', path: '/company/reports', color: '#10B981', icon: CheckSquare },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => navigate(a.path)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-600 transition-all"
                  style={{ background: `${a.color}0F`, color: a.color, border: `1px solid ${a.color}20` }}
                  onMouseEnter={e => e.currentTarget.style.background = `${a.color}1A`}
                  onMouseLeave={e => e.currentTarget.style.background = `${a.color}0F`}>
                  <span className="flex items-center gap-2"><Icon size={14} /> {a.label}</span>
                  <ArrowRight size={13} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Recent Leads</p>
          <button className="btn-secondary text-xs" onClick={() => navigate('/company/leads')}>
            View All <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Lead</th><th>Contact</th><th>Status</th><th>Value</th><th>Priority</th><th>Last Contact</th></tr>
            </thead>
            <tbody>
              {recentLeads.map(l => (
                <tr key={l.id}>
                  <td>
                    <div>
                      <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{l.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.source}</p>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{l.contact}</td>
                  <td><Badge value={l.status} /></td>
                  <td><span className="font-mono text-xs font-600" style={{ color: '#10B981' }}>₹{l.value?.toLocaleString()}</span></td>
                  <td><Badge value={l.priority} /></td>
                  <td style={{ fontSize: 12 }}>{l.lastContact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
