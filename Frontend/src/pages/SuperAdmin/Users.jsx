import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader,
  Badge,
  ConfirmDialog,
  EmptyState,
} from '../../components/common';
import { Search, Users, Power, Trash2, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ROLE_COLORS = {
  super_admin: '#EF4444',
  company_admin: '#A855F7',
  user: '#0EA5E9',
  manager: '#0EA5E9',
  sales: '#F59E0B',
  support: '#6366F1',
  finance: '#10B981',
};

const formatLastLogin = (lastLoginAt) => {
  if (!lastLoginAt) return 'Never';

  const loginDate = new Date(lastLoginAt);
  if (Number.isNaN(loginDate.getTime())) return 'Never';

  const now = new Date();
  const diffMs = now - loginDate;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return loginDate.toLocaleDateString();
};

const getLastLoginColor = (lastLoginAt) => {
  const formatted = formatLastLogin(lastLoginAt);

  if (!formatted || formatted === 'Never') return '#EF4444';
  if (
    formatted === 'Just now' ||
    formatted.includes('min') ||
    formatted.includes('hour')
  ) {
    return '#10B981';
  }
  if (formatted.includes('day') || formatted === 'Yesterday') return '#F59E0B';
  return '#64748B';
};

const formatRoleLabel = (role) => {
  if (!role) return 'User';
  return role.replace(/_/g, ' ');
};

export default function SAUsers() {
  const {
    users,
    companies,
    toggleUserStatus,
    deleteUser,
  } = useAuth();

  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const getCompanyName = (companyId) =>
    companies.find((company) => company.id === companyId)?.name || '—';

  const getCompanyPlan = (companyId) =>
    companies.find((company) => company.id === companyId)?.plan || 'free';

  const roleOptions = useMemo(() => {
    return [...new Set(users.map((user) => user.role).filter(Boolean))];
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const fullName = user.fullName?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';

      const matchSearch =
        fullName.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase());

      const matchCompany =
        filterCompany === 'all' || user.companyId === filterCompany;

      const matchRole =
        filterRole === 'all' || user.role === filterRole;

      const matchStatus =
        filterStatus === 'all' || user.status === filterStatus;

      return matchSearch && matchCompany && matchRole && matchStatus;
    });
  }, [users, search, filterCompany, filterRole, filterStatus]);

  const roleData = Object.entries(
    users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {})
  ).map(([role, count]) => ({
    name: role,
    value: count,
    color: ROLE_COLORS[role] || '#64748B',
  }));

  const handleToggleUserStatus = async (userId) => {
    try {
      setTogglingId(userId);
      await toggleUserStatus(userId);
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Failed to change user status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="Global Users"
        subtitle={`${filtered.length} users across all ${companies.length} companies`}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'rgba(14,165,233,0.1)',
            border: '1px solid rgba(14,165,233,0.2)',
          }}
        >
          <Users size={13} style={{ color: '#0EA5E9' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0EA5E9' }}>
            {users.length} Total Users
          </span>
        </div>
      </PageHeader>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1.2fr',
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: 'Active Users',
            count: users.filter((user) => user.status === 'active').length,
            color: '#10B981',
          },
          {
            label: 'Suspended',
            count: users.filter((user) => user.status === 'suspended').length,
            color: '#EF4444',
          },
          {
            label: 'Admins',
            count: users.filter((user) => user.role === 'company_admin').length,
            color: '#A855F7',
          },
          {
            label: 'Standard Users',
            count: users.filter((user) => user.role === 'user').length,
            color: '#0EA5E9',
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: stat.color,
                marginBottom: 4,
              }}
            >
              {stat.count}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}

        <div
          className="card p-4"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <ResponsiveContainer width={80} height={80}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={38}
                paddingAngle={3}
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid #1E2D45',
                  borderRadius: 8,
                  fontSize: 11,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {roleData.map((role) => (
              <div
                key={role.name}
                style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 2,
                    background: role.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {formatRoleLabel(role.name)} ({role.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input-field"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-field"
          style={{ width: 170 }}
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
        >
          <option value="all">All Companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>

        <select
          className="select-field"
          style={{ width: 160 }}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {formatRoleLabel(role)}
            </option>
          ))}
        </select>

        <select
          className="select-field"
          style={{ width: 130 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="invited">Invited</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description="No users match your search criteria."
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Plan</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((user) => {
                  const lastLoginLabel = formatLastLogin(user.lastLoginAt);
                  const loginColor = getLastLoginColor(user.lastLoginAt);
                  const roleColor = ROLE_COLORS[user.role] || '#64748B';
                  const plan = getCompanyPlan(user.companyId);

                  const planColors = {
                    enterprise: '#A855F7',
                    pro: '#0EA5E9',
                    starter: '#F59E0B',
                    free: '#64748B',
                  };

                  return (
                    <tr key={user.id}>
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              flexShrink: 0,
                              background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              color: 'white',
                            }}
                          >
                            {user.avatar || user.fullName?.[0] || 'U'}
                          </div>

                          <div>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: 'var(--text-primary)',
                              }}
                            >
                              {user.fullName}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontWeight: 600,
                            background: 'rgba(14,165,233,0.08)',
                            color: '#0EA5E9',
                          }}
                        >
                          {getCompanyName(user.companyId)}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 20,
                            textTransform: 'uppercase',
                            background: `${planColors[plan] || '#64748B'}18`,
                            color: planColors[plan] || '#64748B',
                          }}
                        >
                          {plan}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          {user.role === 'company_admin' && (
                            <Shield size={11} style={{ color: '#A855F7' }} />
                          )}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: roleColor,
                              textTransform: 'capitalize',
                            }}
                          >
                            {formatRoleLabel(user.role)}
                          </span>
                        </div>
                      </td>

                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {user.department || '—'}
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background:
                                user.status === 'active' ? '#10B981' : '#EF4444',
                            }}
                          />
                          <Badge value={user.status} />
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: loginColor,
                          }}
                        >
                          {lastLoginLabel}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <button
                            title={
                              user.status === 'active'
                                ? 'Suspend user'
                                : 'Activate user'
                            }
                            onClick={() => handleToggleUserStatus(user.id)}
                            disabled={togglingId === user.id}
                            style={{
                              padding: 6,
                              borderRadius: 8,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color:
                                user.status === 'active'
                                  ? '#10B981'
                                  : '#EF4444',
                              transition: 'all 0.15s',
                              opacity: togglingId === user.id ? 0.6 : 1,
                            }}
                          >
                            <Power size={14} />
                          </button>

                          <button
                            title="Delete user"
                            onClick={() => setDeleteTarget(user)}
                            style={{
                              padding: 6,
                              borderRadius: 8,
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#EF4444';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {filtered.length} of {users.length} users
            </p>

            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Active:{' '}
              <span style={{ color: '#10B981', fontWeight: 700 }}>
                {users.filter((user) => user.status === 'active').length}
              </span>
              &nbsp;·&nbsp;Suspended:{' '}
              <span style={{ color: '#EF4444', fontWeight: 700 }}>
                {users.filter((user) => user.status === 'suspended').length}
              </span>
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  );
}