import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common';
import {
  API_RESPONSE_TREND, SESSION_TREND, PLATFORM_HEALTH, MODULE_USAGE
} from '../../data/mockData';
import {
  Server, Wifi, Database, Cpu, Shield, Clock,
  CheckCircle, AlertTriangle, HardDrive, Users, Zap, Globe
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#0D1421', border: '1px solid #1E2D45', borderRadius: 10, padding: '8px 14px' }}>
        <p style={{ color: '#64748B', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
            {p.value}{p.name === 'ms' ? ' ms' : p.name === 'sessions' ? ' sessions' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const GaugeBar = ({ label, value, max, color, unit = '%' }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}{unit}</span>
    </div>
    <div style={{ height: 6, borderRadius: 6, background: 'var(--border-primary)' }}>
      <div style={{ height: '100%', borderRadius: 6, background: color, width: `${(value / max) * 100}%`, transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

const StatusPill = ({ label, status }) => {
  const ok = status === 'operational';
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase',
        background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: ok ? '#10B981' : '#EF4444' }}>
        {status}
      </span>
    </div>
  );
};

export default function SASystemHealth() {
  const { companies, users } = useAuth();
  const [refreshTime] = useState(new Date().toLocaleTimeString('en-IN'));

  const services = [
    { label: 'API Gateway',        status: 'operational' },
    { label: 'Authentication',     status: 'operational' },
    { label: 'Database (Primary)', status: 'operational' },
    { label: 'Database (Replica)', status: 'operational' },
    { label: 'Email Service',      status: 'operational' },
    { label: 'File Storage (S3)',  status: 'operational' },
    { label: 'Background Jobs',    status: 'operational' },
    { label: 'WebSocket Server',   status: 'degraded'    },
  ];

  const operationalCount = services.filter(s => s.status === 'operational').length;

  return (
    <div className="page-enter">
      <PageHeader
        title="System Health Monitor"
        subtitle="Real-time infrastructure status and performance metrics">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Last refresh: {refreshTime}
        </div>
      </PageHeader>

      {/* Top Status Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Uptime',          value: `${PLATFORM_HEALTH.uptime}%`,   icon: Shield,    color: '#10B981', sub: '30-day avg' },
          { label: 'API Response',    value: `${PLATFORM_HEALTH.apiResponseMs}ms`, icon: Globe,  color: '#0EA5E9', sub: 'avg latency' },
          { label: 'Active Sessions', value: PLATFORM_HEALTH.activeSessions,  icon: Users,     color: '#6366F1', sub: 'right now' },
          { label: 'Error Rate',      value: `${PLATFORM_HEALTH.errorRate}%`, icon: AlertTriangle, color: '#10B981', sub: '<0.1% is ok' },
          { label: 'DB Usage',        value: `${PLATFORM_HEALTH.dbUsagePercent}%`, icon: Database, color: '#F59E0B', sub: 'of capacity' },
          { label: 'Storage Used',    value: `${PLATFORM_HEALTH.storageUsedGB}GB`,  icon: HardDrive, color: '#A855F7', sub: `of ${PLATFORM_HEALTH.storageTotalGB}GB` },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{s.label}</p>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} style={{ color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* API Response Trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>API Response Time (24h)</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Avg latency in milliseconds · threshold: 200ms</p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
              Normal
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={API_RESPONSE_TREND}>
              <defs>
                <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} unit="ms" />
              <Tooltip content={<ChartTooltip />} />
              {/* Threshold line ref */}
              <Area type="monotone" dataKey="ms" name="ms" stroke="#0EA5E9" strokeWidth={2} fill="url(#apiGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Active Sessions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Active Session Load (24h)</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Concurrent authenticated sessions</p>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#6366F1' }}>
              {PLATFORM_HEALTH.activeSessions}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={SESSION_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.5)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="sessions" name="sessions" stroke="#6366F1" strokeWidth={2.5}
                dot={{ fill: '#6366F1', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services + Resources Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Service Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Service Status</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>All platform microservices</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} style={{ color: '#10B981' }} />
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>{operationalCount}/{services.length} Operational</span>
            </div>
          </div>
          <div>
            {services.map(s => <StatusPill key={s.label} label={s.label} status={s.status} />)}
          </div>
        </div>

        {/* Resource Usage */}
        <div className="card p-5">
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Resource Usage</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>Infrastructure consumption metrics</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GaugeBar label="Database Storage" value={PLATFORM_HEALTH.dbUsagePercent} max={100} color="#F59E0B" />
            <GaugeBar label="File Storage" value={Math.round((PLATFORM_HEALTH.storageUsedGB / PLATFORM_HEALTH.storageTotalGB) * 100)} max={100} color="#A855F7" />
            <GaugeBar label="API Rate Utilization" value={62} max={100} color="#0EA5E9" />
            <GaugeBar label="Email Quota Used" value={28} max={100} color="#6366F1" />
            <GaugeBar label="Background Job Queue" value={12} max={100} color="#10B981" />
          </div>

          <div className="mt-6 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
            {[
              { label: 'Total Companies', value: companies.length, color: '#0EA5E9' },
              { label: 'Total Users',     value: users.length,     color: '#6366F1' },
              { label: 'Module Configs',  value: `${MODULE_USAGE.length}`,   color: '#F59E0B' },
              { label: 'Automations',     value: '5 active',       color: '#A855F7' },
            ].map(m => (
              <div key={m.label} className="rounded-lg p-3" style={{ background: 'var(--bg-secondary)' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
