// ─── MODULE CONTROL ──────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common';
import { ALL_MODULES } from '../../data/mockData';
import * as Icons from 'lucide-react';

export default function CAModuleControl() {
  const { currentCompany, toggleCompanyModule } = useAuth();
  const enabledModules = currentCompany?.enabledModules || [];

  const moduleGroups = [
    { label: 'Core CRM', ids: ['leads', 'deals', 'contacts', 'tasks'] },
    { label: 'Finance', ids: ['payments'] },
    { label: 'Analytics', ids: ['reports'] },
    { label: 'Productivity', ids: ['automation', 'emails'] },
    { label: 'Support', ids: ['tickets'] },
    { label: 'Advanced', ids: ['ai', 'integrations', 'custom'] },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Module Control" subtitle="Toggle which modules your team can access" />

      <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
        <p className="text-sm font-700 mb-1" style={{ color: '#0EA5E9' }}>🔥 Dynamic Visibility Engine</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Modules you disable here will <strong style={{ color: 'var(--text-primary)' }}>immediately disappear</strong> from all employee dashboards.
          Only modules allowed by your TrackField plan are available.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {moduleGroups.map(group => {
          const groupModules = ALL_MODULES.filter(m => group.ids.includes(m.id));
          if (groupModules.length === 0) return null;
          return (
            <div key={group.label}>
              <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{group.label}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupModules.map(m => {
                  const Icon = Icons[m.icon] || Icons.Package;
                  const isEnabled = enabledModules.includes(m.id);
                  return (
                    <div key={m.id}
                      className="card p-4 flex items-start gap-4 transition-all"
                      style={{ borderColor: isEnabled ? 'rgba(14,165,233,0.25)' : 'var(--border-primary)', opacity: isEnabled ? 1 : 0.6 }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: isEnabled ? 'rgba(14,165,233,0.12)' : 'rgba(100,116,139,0.08)' }}>
                        <Icon size={18} style={{ color: isEnabled ? '#0EA5E9' : '#475569' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                          <label className="toggle-switch flex-shrink-0 ml-2">
                            <input type="checkbox" checked={isEnabled} onChange={() => toggleCompanyModule(m.id)} />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.description}</p>
                        <p className="text-xs mt-1.5 font-700" style={{ color: isEnabled ? '#10B981' : '#475569' }}>
                          {isEnabled ? '✓ Enabled' : '✕ Disabled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 card p-4">
        <p className="text-sm font-700 mb-2" style={{ color: 'var(--text-primary)' }}>Active Modules Summary</p>
        <div className="flex flex-wrap gap-2">
          {ALL_MODULES.map(m => (
            <span key={m.id} className="text-xs px-2.5 py-1 rounded-lg font-600"
              style={{
                background: enabledModules.includes(m.id) ? 'rgba(14,165,233,0.1)' : 'rgba(100,116,139,0.06)',
                color: enabledModules.includes(m.id) ? '#0EA5E9' : '#475569',
                border: `1px solid ${enabledModules.includes(m.id) ? 'rgba(14,165,233,0.2)' : 'rgba(100,116,139,0.1)'}`,
              }}>
              {m.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
