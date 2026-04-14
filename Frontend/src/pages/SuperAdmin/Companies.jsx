import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader,
  Badge,
  Modal,
  FormGroup,
  ConfirmDialog,
  EmptyState,
} from '../../components/common';
import { ALL_MODULES } from '../../data/mockData';
import {
  Plus,
  Search,
  Building2,
  Edit2,
  Trash2,
  Power,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const INDUSTRIES = [
  'Technology',
  'Retail',
  'Education',
  'Finance',
  'Healthcare',
  'Real Estate',
  'Media',
  'Manufacturing',
  'Other',
];

const INITIAL_FORM = {
  name: '',
  domain: '',
  industry: 'Technology',
  plan: 'pro',
  adminName: '',
  adminEmail: '',
  adminPassword: 'admin123',
  enabledModules: ALL_MODULES.map((m) => m.id),
};

function CompanyForm({
  form,
  setForm,
  isEdit = false,
  errorMessage,
  toggleModule,
}) {
  return (
    <div className="flex flex-col gap-4">
      {errorMessage ? (
        <div
          className="rounded-xl px-3 py-2 text-sm font-600"
          style={{
            background: 'rgba(239,68,68,0.08)',
            color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Company Name" required>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Acme Corp"
          />
        </FormGroup>

        <FormGroup label="Domain">
          <input
            className="input-field"
            value={form.domain}
            onChange={(e) => setForm((prev) => ({ ...prev, domain: e.target.value }))}
            placeholder="acme.com"
          />
        </FormGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Industry">
          <select
            className="select-field"
            value={form.industry}
            onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
          >
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup label="Plan">
          <select
            className="select-field"
            value={form.plan}
            onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value }))}
          >
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro — ₹49/mo</option>
            <option value="enterprise">Enterprise — ₹199/mo</option>
          </select>
        </FormGroup>
      </div>

      <div style={{ height: 1, background: 'var(--border-primary)' }}></div>

      <p
        className="text-xs font-700 uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        Admin Account
      </p>

      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Admin Name" required>
          <input
            className="input-field"
            value={form.adminName}
            onChange={(e) => setForm((prev) => ({ ...prev, adminName: e.target.value }))}
            placeholder="John Doe"
            disabled={isEdit}
          />
        </FormGroup>

        <FormGroup label="Admin Email" required>
          <input
            className="input-field"
            type="email"
            value={form.adminEmail}
            onChange={(e) => setForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
            placeholder="admin@acme.com"
            disabled={isEdit}
          />
        </FormGroup>
      </div>

      <FormGroup label={isEdit ? 'Initial Password (creation only)' : 'Initial Password'}>
        <input
          className="input-field"
          value={form.adminPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
          placeholder={isEdit ? 'Password change not supported here' : 'admin123'}
          disabled={isEdit}
        />
      </FormGroup>

      {isEdit ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Admin credentials are created with the company. Change admin user details from the users/admin management flow.
        </p>
      ) : null}

      <div style={{ height: 1, background: 'var(--border-primary)' }}></div>

      <div>
        <p
          className="text-xs font-700 uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Enabled Modules{' '}
          <span style={{ color: '#0EA5E9' }}>
            ({form.enabledModules?.length || 0}/{ALL_MODULES.length})
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2">
          {ALL_MODULES.map((module) => (
            <label key={module.id} className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={form.enabledModules?.includes(module.id)}
                onChange={() => toggleModule(module.id)}
                style={{ accentColor: '#0EA5E9' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {module.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SACompanies() {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    toggleCompanyStatus,
  } = useAuth();

  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const companyName = c?.name?.toLowerCase?.() || '';
      const companyDomain = c?.domain?.toLowerCase?.() || '';

      const matchSearch =
        companyName.includes(search.toLowerCase()) ||
        companyDomain.includes(search.toLowerCase());

      const matchPlan = filterPlan === 'all' || c.plan === filterPlan;
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [companies, search, filterPlan, filterStatus]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrorMessage('');
  };

  const handleCloseAdd = () => {
    if (submitting) return;
    setShowAdd(false);
    resetForm();
  };

  const handleCloseEdit = () => {
    if (submitting) return;
    setEditTarget(null);
    resetForm();
  };

  const handleAdd = async () => {
    setErrorMessage('');

    if (!form.name?.trim()) {
      setErrorMessage('Company name is required.');
      return;
    }

    if (!form.adminName?.trim()) {
      setErrorMessage('Admin name is required.');
      return;
    }

    if (!form.adminEmail?.trim()) {
      setErrorMessage('Admin email is required.');
      return;
    }

    if (!form.adminPassword?.trim()) {
      setErrorMessage('Admin password is required.');
      return;
    }

    try {
      setSubmitting(true);

      await addCompany({
        name: form.name.trim(),
        domain: form.domain.trim(),
        industry: form.industry,
        plan: form.plan,
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        enabledModules: form.enabledModules,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
      });

      setShowAdd(false);
      resetForm();
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.message || 'Failed to create company.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget?.id) return;

    setErrorMessage('');

    if (!form.name?.trim()) {
      setErrorMessage('Company name is required.');
      return;
    }

    try {
      setSubmitting(true);

      await updateCompany(editTarget.id, {
        name: form.name.trim(),
        domain: form.domain.trim(),
        industry: form.industry,
        plan: form.plan,
        status: editTarget.status || 'active',
        enabledModules: form.enabledModules || [],
      });

      setEditTarget(null);
      resetForm();
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.message || 'Failed to update company.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);
      await deleteCompany(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Failed to delete company.');
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (company) => {
    setErrorMessage('');
    setEditTarget(company);
    setForm({
      name: company.name || '',
      domain: company.domain || '',
      industry: company.industry || 'Technology',
      plan: company.plan || 'pro',
      adminName: company.adminName || '',
      adminEmail: company.adminEmail || '',
      adminPassword: '',
      enabledModules: company.enabledModules || [],
    });
  };

  const toggleModule = (moduleId) => {
    setForm((prev) => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(moduleId)
        ? prev.enabledModules.filter((m) => m !== moduleId)
        : [...prev.enabledModules, moduleId],
    }));
  };

  const handleToggleCompanyStatus = async (companyId) => {
    try {
      setTogglingId(companyId);
      await toggleCompanyStatus(companyId);
    } catch (error) {
      console.error(error);
      alert(error?.message || 'Failed to change company status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title="Companies" subtitle={`${filtered.length} companies on platform`}>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Company
        </button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            className="input-field pl-9"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-field"
          style={{ width: 130 }}
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          className="select-field"
          style={{ width: 130 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description="No companies match your search criteria."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="card card-hover">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-700 flex-shrink-0"
                      style={{
                        background: 'rgba(14,165,233,0.1)',
                        color: '#0EA5E9',
                        border: '1px solid rgba(14,165,233,0.2)',
                      }}
                    >
                      {(c.name || 'C').slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-700 text-sm" style={{ color: 'var(--text-primary)' }}>
                          {c.name}
                        </p>
                        <Badge value={c.status} />
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {c.domain || '—'} · {c.industry || 'Other'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-6">
                      {[
                        { label: 'Users', value: c.users ?? 0 },
                        { label: 'Leads', value: c.leads?.toLocaleString?.() ?? 0 },
                        { label: 'Revenue', value: `₹${(c.revenue || 0).toLocaleString()}/mo` },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="font-700 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {stat.value}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Badge value={c.plan} />

                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        title={c.status === 'active' ? 'Deactivate' : 'Activate'}
                        style={{ color: c.status === 'active' ? '#10B981' : '#64748B' }}
                        onClick={() => handleToggleCompanyStatus(c.id)}
                        disabled={togglingId === c.id}
                      >
                        <Power size={15} />
                      </button>

                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        title="Edit"
                        onClick={() => openEdit(c)}
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#0EA5E9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        title="Delete"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={() => setDeleteTarget(c)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        <Trash2 size={15} />
                      </button>

                      <button
                        className="p-1.5 rounded-lg transition-colors"
                        title="Toggle details"
                        style={{ color: 'var(--text-muted)' }}
                        onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      >
                        {expandedId === c.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedId === c.id && (
                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: '1px solid var(--border-primary)' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p
                          className="text-xs font-700 uppercase tracking-widest mb-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Admin Info
                        </p>
                        <p className="text-sm font-600" style={{ color: 'var(--text-primary)' }}>
                          {c.adminName || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {c.adminEmail || '—'}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Joined:{' '}
                          {c.joinedDate ? new Date(c.joinedDate).toLocaleDateString() : '—'}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <p
                          className="text-xs font-700 uppercase tracking-widest mb-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Enabled Modules ({c.enabledModules?.length || 0}/{ALL_MODULES.length})
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {ALL_MODULES.map((module) => (
                            <span
                              key={module.id}
                              className="text-xs px-2 py-1 rounded-lg font-600"
                              style={{
                                background: c.enabledModules?.includes(module.id)
                                  ? 'rgba(14,165,233,0.1)'
                                  : 'rgba(100,116,139,0.08)',
                                color: c.enabledModules?.includes(module.id)
                                  ? '#0EA5E9'
                                  : '#475569',
                                border: `1px solid ${c.enabledModules?.includes(module.id)
                                    ? 'rgba(14,165,233,0.2)'
                                    : 'rgba(100,116,139,0.1)'
                                  }`,
                              }}
                            >
                              {module.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={handleCloseAdd} title="Add New Company" width={620}>
        <CompanyForm
          form={form}
          setForm={setForm}
          isEdit={false}
          errorMessage={errorMessage}
          toggleModule={toggleModule}
        />
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={handleCloseAdd} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleAdd} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Company'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!editTarget} onClose={handleCloseEdit} title="Edit Company" width={620}>
        <CompanyForm
          form={form}
          setForm={setForm}
          isEdit={true}
          errorMessage={errorMessage}
          toggleModule={toggleModule}
        />
        <div className="flex gap-3 justify-end mt-6">
          <button className="btn-secondary" onClick={handleCloseEdit} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleEdit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Delete Company"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All associated users and data will be removed.`}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  );
}

