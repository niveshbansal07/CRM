import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Shield, Building2, User, ArrowRight, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    subtitle: 'TrackField Platform Owner',
    email: 'owner@trackfield.io',
    password: 'trackfield123',
    color: '#A855F7',
    icon: Shield,
    description: 'Full platform control, manage all companies & users',
  },
  {
    role: 'company_admin',
    label: 'Company Admin',
    subtitle: 'Nexora Solutions',
    email: 'admin@nexora.io',
    password: 'admin123',
    color: '#0EA5E9',
    icon: Building2,
    description: 'Manage your team, CRM modules & permissions',
  },
  {
    role: 'user',
    label: 'Sales User',
    subtitle: 'Nexora Solutions',
    email: 'rohan@nexora.io',
    password: 'user123',
    color: '#10B981',
    icon: User,
    description: 'Daily CRM operations: leads, deals & tasks',
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600)); // simulate async
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'super_admin') navigate('/admin/dashboard');
      else if (result.role === 'company_admin') navigate('/company/dashboard');
      else navigate('/user/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex grid-bg" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-10" style={{ borderRight: '1px solid var(--border-primary)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 -mt-5 ">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
            <span className="font-display font-800 text-white text-sm tracking-widest">TF</span>
          </div>
          <span className="font-display font-700 text-xl tracking-widest" style={{ color: 'var(--text-primary)', letterSpacing: '0.15em' }}>
            TRACKFIELD
          </span>
        </div>

        {/* Hero text */}
        <div>
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-700 mt-4 mb-4"
              style={{ background: 'rgba(14,165,233,0.12)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
              ● B2B CRM PLATFORM
            </span>
            <h1 className="font-display font-700 leading-tight mb-4"
              style={{ fontSize: '3.5rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              SELL SMARTER.<br />
              <span style={{ color: '#0EA5E9' }}>GROW FASTER.</span>
            </h1>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
              The only CRM your team will actually use. Three-tier control architecture
              for companies that mean business.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {[
              { label: 'Multi-company SaaS architecture', color: '#0EA5E9' },
              { label: 'Dynamic visibility engine', color: '#A855F7' },
              { label: 'Role-based permission system', color: '#10B981' },
              { label: 'Real-time analytics & automation', color: '#F59E0B' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: f.color }}></div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-3">
          {[
            { value: '5K+', label: 'Companies' },
            { value: '99.9%', label: 'Uptime' },
            { value: '3-Tier', label: 'Control' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>
              <p className="font-display font-700 text-2xl" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0EA5E9, #6366F1)' }}>
              <span className="font-display font-800 text-white text-sm">TF</span>
            </div>
            <span className="font-display font-700 text-lg tracking-widest" style={{ color: 'var(--text-primary)' }}>TRACKFIELD</span>
          </div>

          <h2 className="font-display font-700 text-3xl mb-1 tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Sign In
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Access your TRACKFIELD CRM dashboard
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-6">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-1"
              style={{ height: 46 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          {/* <div>
            <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Quick Demo Access
            </p>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map(account => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.role}
                    onClick={() => fillDemo(account)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                    style={{
                      background: 'var(--bg-card)',
                      border: `1px solid ${email === account.email ? account.color + '40' : 'var(--border-primary)'}`,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = account.color + '40'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = email === account.email ? account.color + '40' : 'var(--border-primary)'}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: account.color + '18' }}>
                      <Icon size={17} style={{ color: account.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-600" style={{ color: 'var(--text-primary)' }}>{account.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{account.subtitle}</p>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                );
              })}
            </div>
          </div> */}

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            TrackField CRM — B2B SaaS Platform
          </p>
        </div>
      </div>
    </div>
  );
}
