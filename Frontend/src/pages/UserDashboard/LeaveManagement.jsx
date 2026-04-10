import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, ConfirmDialog, EmptyState } from '../../components/common';
import { Calendar, Filter, CheckCircle2, XCircle, Search, User, Clock } from 'lucide-react';

export default function LeaveManagement() {
  const { currentCompany, leaves, updateLeave, users } = useAuth();
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { id: 'lv1', action: 'approve'/'reject' }

  // Ensure we only see leaves for current company
  const companyLeaves = leaves.filter(l => l.companyId === currentCompany?.id);
  
  const pendingCount = companyLeaves.filter(l => l.status === 'pending').length;
  const approvedCount = companyLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = companyLeaves.filter(l => l.status === 'rejected').length;

  const filteredLeaves = companyLeaves.filter(l => {
    const user = users.find(u => u.id === l.userId);
    const searchMatch = user?.name.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase());
    const statusMatch = filterStatus === 'all' || l.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const handleAction = () => {
    if (!confirmAction) return;
    updateLeave(confirmAction.id, { status: confirmAction.action.toLowerCase() + 'd' });
    setConfirmAction(null);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <Badge value="approved" type="success" />;
      case 'rejected': return <Badge value="rejected" type="danger" />;
      default: return <Badge value="pending" type="warning" />;
    }
  };

  return (
    <div className="page-enter">
      <PageHeader 
        title="Leave Approvals" 
        subtitle={`Manage ${pendingCount} pending leave requests across the company`}
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 flex items-center justify-between border-l-4" style={{ borderColor: '#F59E0B' }}>
          <div>
            <p className="text-[11px] font-700 text-muted uppercase tracking-wider mb-1">Pending Approval</p>
            <p className="text-3xl font-display font-700 text-primary">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Clock size={24} />
          </div>
        </div>
        <div className="card p-5 flex items-center justify-between border-l-4" style={{ borderColor: '#10B981' }}>
          <div>
            <p className="text-[11px] font-700 text-muted uppercase tracking-wider mb-1">Approved Leaves</p>
            <p className="text-3xl font-display font-700 text-primary">{approvedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="card p-5 flex items-center justify-between border-l-4" style={{ borderColor: '#EF4444' }}>
          <div>
            <p className="text-[11px] font-700 text-muted uppercase tracking-wider mb-1">Rejected Leaves</p>
            <p className="text-3xl font-display font-700 text-primary">{rejectedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <XCircle size={24} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div className="relative max-w-sm w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              className="input-field pl-9" 
              placeholder="Search employee or leave type..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-primary">
              <Filter size={14} className="text-muted" />
              <select className="bg-transparent text-sm font-600 text-primary border-none outline-none cursor-pointer" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <EmptyState icon={Calendar} title="No Leave Requests" description="There are no leave requests matching your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map(leave => {
                  const user = users.find(u => u.id === leave.userId);
                  return (
                    <tr key={leave.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-700 text-xs">
                            {user?.avatar}
                          </div>
                          <div>
                            <p className="font-600 text-sm text-primary">{user?.name}</p>
                            <p className="text-xs text-muted">{user?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-600 text-sm">{leave.type}</div>
                        <div className="text-xs text-muted">Applied: {leave.appliedOn}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar size={12} className="text-muted" />
                          <span>{leave.startDate} to {leave.endDate}</span>
                        </div>
                      </td>
                      <td className="max-w-[200px]">
                        <p className="text-sm truncate text-secondary" title={leave.reason}>{leave.reason}</p>
                      </td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {leave.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => setConfirmAction({ id: leave.id, action: 'Approve' })}
                                className="p-1.5 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                onClick={() => setConfirmAction({ id: leave.id, action: 'Reject' })}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`${confirmAction?.action} Leave Request`}
        message={`Are you sure you want to ${confirmAction?.action?.toLowerCase()} this leave request?`}
        onConfirm={handleAction}
        confirmText={confirmAction?.action}
        confirmStyle={confirmAction?.action === 'Reject' ? 'danger' : 'primary'}
      />
    </div>
  );
}
