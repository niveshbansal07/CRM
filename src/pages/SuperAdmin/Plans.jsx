import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge } from '../../components/common';
import { ALL_MODULES, PLANS } from '../../data/mockData';
import { Check, Package, Zap, Crown, Users, HardDrive, TrendingUp } from 'lucide-react';

export default function SAPlans() {
  const { companies, updateCompany } = useAuth();
  const [changingPlan, setChangingPlan] = useState(null);

  const planIcons = { free: Package, pro: Zap, enterprise: Crown };
  const planColors = { free: '#64748B', pro: '#0EA5E9', enterprise: '#A855F7' };

  const handleChangePlan = (companyId, newPlan) => {
    const planConfig = PLANS[newPlan];
    updateCompany(companyId, {
      plan: newPlan,
      revenue: planConfig.price,
    });
    setChangingPlan(null);
  };

  return (
    <div className="page-enter">
      <PageHeader title="Plans & Billing" subtitle="Manage subscription plans and company billing" />

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(PLANS).map(([key, plan]) => {
          const Icon = planIcons[key];
          const color = planColors[key];
          const companyCount = companies.filter(c => c.plan === key).length;
          return (
            <div key={key} className="card p-5" style={{ borderColor: key === 'enterprise' ? 'rgba(168,85,247,0.3)' : 'var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-700 text-sm" style={{ color: 'var(--text-primary)' }}>{plan.name}</p>
                    <p className="text-xs" style={{ color }}>
                      {plan.price === 0 ? 'Free forever' : `₹${plan.price}/month`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-700 text-xl font-display" style={{ color: 'var(--text-primary)' }}>{companyCount}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>companies</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {[
                  { icon: Users, label: `${plan.users === 999 ? 'Unlimited' : plan.users} users` },
                  { icon: TrendingUp, label: `${plan.leads === 99999 ? 'Unlimited' : plan.leads.toLocaleString()} leads` },
                  { icon: HardDrive, label: plan.storage + ' storage' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2">
                    <f.icon size={13} style={{ color }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{f.label}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <p className="text-xs font-700" style={{ color: 'var(--text-muted)' }}>
                  Revenue: <span style={{ color: '#10B981' }}>₹{(companyCount * plan.price).toLocaleString()}/mo</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Summary */}
      <div className="card p-5 mb-6">
        <p className="text-sm font-700 mb-3" style={{ color: 'var(--text-primary)' }}>Revenue Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Revenue', value: `₹${companies.reduce((s,c) => s + (c.revenue||0), 0).toLocaleString()}`, color: '#10B981' },
            { label: 'Annual Projection', value: `₹${(companies.reduce((s,c) => s + (c.revenue||0), 0) * 12).toLocaleString()}`, color: '#0EA5E9' },
            { label: 'Active Paid', value: companies.filter(c => c.plan !== 'free' && c.status === 'active').length, color: '#A855F7' },
            { label: 'Free Accounts', value: companies.filter(c => c.plan === 'free').length, color: '#64748B' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-xl font-display font-700 mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Plan Management */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Company Plan Management</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Change plan for individual companies</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Current Plan</th>
                <th>Status</th>
                <th>Monthly Revenue</th>
                <th>Users</th>
                <th>Change Plan</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-700"
                        style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9' }}>
                        {c.name.slice(0,2).toUpperCase()}
                      </div>
                      <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    </div>
                  </td>
                  <td><Badge value={c.plan} /></td>
                  <td><Badge value={c.status} /></td>
                  <td>
                    <span className="font-mono text-xs font-600" style={{ color: '#10B981' }}>
                      ₹{(c.revenue||0).toLocaleString()}/mo
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.users}</td>
                  <td>
                    {changingPlan === c.id ? (
                      <div className="flex items-center gap-2">
                        {Object.keys(PLANS).map(p => (
                          <button key={p}
                            onClick={() => handleChangePlan(c.id, p)}
                            className="text-xs px-2.5 py-1.5 rounded-lg font-700 transition-all"
                            style={{
                              background: c.plan === p ? `${planColors[p]}20` : 'transparent',
                              color: planColors[p],
                              border: `1px solid ${planColors[p]}30`,
                            }}>
                            {PLANS[p].name}
                          </button>
                        ))}
                        <button className="text-xs" style={{ color: 'var(--text-muted)' }} onClick={() => setChangingPlan(null)}>✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setChangingPlan(c.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-600 transition-all btn-secondary">
                        Change Plan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
