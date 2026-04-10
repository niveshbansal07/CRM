import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge } from '../../components/common';
import { ALL_MODULES, PLANS } from '../../data/mockData';
import { Check, Package, Zap, Crown, Users, HardDrive, TrendingUp, X, Star, ArrowRight } from 'lucide-react';

const PLAN_FEATURES = {
  free: [
    'Up to 5 users',
    '100 leads / month',
    '1GB storage',
    'Basic Leads module',
    'Basic Contacts',
    'Email support',
  ],
  pro: [
    'Up to 25 users',
    '5,000 leads / month',
    '20GB storage',
    'All core modules',
    'Email campaigns',
    'Reports & Analytics',
    'Priority email support',
    'Custom fields',
  ],
  enterprise: [
    'Unlimited users',
    'Unlimited leads',
    '500GB storage',
    'All modules included',
    'AI-powered scoring',
    'Advanced automation',
    'Custom integrations',
    'Dedicated account manager',
    'SLA guarantee',
    '24/7 phone support',
    'SSO / SAML',
  ],
};

export default function SAPlans() {
  const { companies, updateCompany } = useAuth();
  const [changingPlan, setChangingPlan] = useState(null);

  const planIcons = { free: Package, pro: Zap, enterprise: Crown };
  const planColors = { free: '#64748B', pro: '#0EA5E9', enterprise: '#A855F7' };
  const planBorderHighlight = { free: 'var(--border-primary)', pro: 'rgba(14,165,233,0.3)', enterprise: 'rgba(168,85,247,0.4)' };

  const handleChangePlan = (companyId, newPlan) => {
    const revenueMap = { free: 0, pro: 588, enterprise: 2388 };
    updateCompany(companyId, { plan: newPlan, revenue: revenueMap[newPlan] });
    setChangingPlan(null);
  };

  const totalMRR = companies.reduce((s, c) => s + (c.revenue || 0), 0);

  return (
    <div className="page-enter">
      <PageHeader title="Plans & Billing" subtitle="Manage subscription tiers and company billing assignments">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20,
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981' }}>Total MRR: ₹{totalMRR.toLocaleString()}</span>
        </div>
      </PageHeader>

      {/* Plan Cards — Stripe-style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {Object.entries(PLANS).map(([key, plan]) => {
          const Icon = planIcons[key];
          const color = planColors[key];
          const companyCount = companies.filter(c => c.plan === key).length;
          const isPopular = key === 'pro';
          const isEnterprise = key === 'enterprise';

          return (
            <div key={key} style={{
              background: 'var(--bg-card)', borderRadius: 16,
              border: `1px solid ${planBorderHighlight[key]}`,
              padding: 24, position: 'relative',
              boxShadow: isEnterprise ? `0 0 30px ${color}15` : 'none',
            }}>
              {/* Popular badge */}
              {isPopular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #0EA5E9, #6366F1)', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={10} fill="white" /> MOST POPULAR
                </div>
              )}
              {isEnterprise && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #A855F7, #6366F1)', color: 'white',
                  fontSize: 10, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                  🏢 BEST VALUE
                </div>
              )}

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</p>
                  <p style={{ fontSize: 13, color, fontWeight: 700 }}>
                    {plan.price === 0 ? 'Free Forever' : `₹${plan.price}/month`}
                  </p>
                </div>
              </div>

              {/* Company count badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
                padding: '10px 14px', borderRadius: 10, background: `${color}0A`, border: `1px solid ${color}18` }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Active companies</span>
                <span style={{ fontSize: 20, fontWeight: 700, color }}>{companyCount}</span>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {PLAN_FEATURES[key].map(feature => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: `${color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={10} style={{ color }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue from plan</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>
                    ₹{(companyCount * plan.price).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Summary */}
      <div className="card p-5 mb-6">
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Platform Revenue Summary</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
          {[
            { label: 'Monthly MRR',     value: `₹${totalMRR.toLocaleString()}`,                color: '#10B981' },
            { label: 'Annual ARR',      value: `₹${(totalMRR * 12).toLocaleString()}`,          color: '#0EA5E9' },
            { label: 'Enterprise MRR',  value: `₹${companies.filter(c=>c.plan==='enterprise').reduce((s,c)=>s+(c.revenue||0),0).toLocaleString()}`, color: '#A855F7' },
            { label: 'Active Paid',     value: companies.filter(c => c.plan !== 'free' && c.status === 'active').length, color: '#6366F1' },
            { label: 'Free Accounts',   value: companies.filter(c => c.plan === 'free').length, color: '#64748B' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 16px', borderRadius: 10, background: `${s.color}0A`, border: `1px solid ${s.color}18` }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Plan Management Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Company Plan Management</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Upgrade, downgrade or manage billing for individual companies</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th><th>Industry</th><th>Current Plan</th><th>Status</th>
                <th>Monthly Revenue</th><th>Users</th><th>Leads</th><th>Change Plan</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${planColors[c.plan]}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: planColors[c.plan] }}>
                        {c.name.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.industry}</td>
                  <td><Badge value={c.plan} /></td>
                  <td><Badge value={c.status} /></td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                      {(c.revenue || 0) > 0 ? `₹${c.revenue.toLocaleString()}/mo` : '—'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.users}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{c.leads?.toLocaleString()}</td>
                  <td>
                    {changingPlan === c.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {Object.keys(PLANS).map(p => (
                          <button key={p} onClick={() => handleChangePlan(c.id, p)}
                            style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
                              background: c.plan === p ? `${planColors[p]}20` : 'transparent',
                              color: planColors[p], border: `1px solid ${planColors[p]}30` }}>
                            {PLANS[p].name}
                          </button>
                        ))}
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}
                          onClick={() => setChangingPlan(null)}><X size={13} /></button>
                      </div>
                    ) : (
                      <button className="btn-secondary" style={{ fontSize: 11, padding: '5px 12px' }}
                        onClick={() => setChangingPlan(c.id)}>
                        Change <ArrowRight size={11} />
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
