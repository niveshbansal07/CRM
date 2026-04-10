import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, EmptyState } from '../../components/common';
import { Calendar, Clock, Plus, Filter, CalendarDays, CheckCircle2, XCircle, Play, Square, HeartPulse, ShieldAlert, Palmtree, Gift } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HRMSUser() {
  const { currentUser, leaves, addLeave, attendance } = useAuth();
  
  const [activeTab, setActiveTab] = useState('attendance');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState(null);
  const [leaveFilter, setLeaveFilter] = useState('all');

  const HOLIDAYS = [
    { date: '15 Aug', name: 'Independence Day', type: 'National', icon: ShieldAlert, color: '#0EA5E9' },
    { date: '02 Oct', name: 'Gandhi Jayanti', type: 'National', icon: CalendarDays, color: '#10B981' },
    { date: '12 Nov', name: 'Diwali', type: 'Festival', icon: Gift, color: '#F59E0B' },
    { date: '25 Dec', name: 'Christmas', type: 'Festival', icon: Palmtree, color: '#EF4444' },
  ];

  const WORK_HOURS = [
    { day: 'Mon', hrs: 8.5 },
    { day: 'Tue', hrs: 9.0 },
    { day: 'Wed', hrs: 7.5 },
    { day: 'Thu', hrs: 8.0 },
    { day: 'Fri', hrs: 9.5 },
  ];
  
  const [form, setForm] = useState({
    type: 'Sick',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const myLeaves = leaves.filter(l => l.userId === currentUser?.id);
  const myAttendance = attendance.filter(a => a.userId === currentUser?.id);
  
  const filteredLeaves = myLeaves.filter(l => leaveFilter === 'all' || l.status === leaveFilter);

  const handleApplyLeave = () => {
    if(!form.startDate || !form.endDate || !form.reason) return;
    addLeave(form);
    setShowApplyModal(false);
    setForm({ type: 'Sick', startDate: '', endDate: '', reason: '' });
  };

  const handlePunch = () => {
    if (!isPunchedIn) {
      setIsPunchedIn(true);
      setPunchTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
    } else {
      setIsPunchedIn(false);
      attendance.unshift({
        id: 'at_new_' + Date.now(),
        userId: currentUser?.id,
        date: new Date().toLocaleDateString(),
        checkIn: punchTime,
        checkOut: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: 'Present'
      });
      setPunchTime(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="page-enter">
      <PageHeader 
        title="Leave & Attendance" 
        subtitle="Manage your attendance tracking and apply for leaves"
      >
        <button className="btn-primary" onClick={() => setShowApplyModal(true)}>
          <Plus size={14} /> Apply Leave
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          {/* Leave Balances Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Casual Leaves', total: 12, used: 4, color: '#0EA5E9', icon: Calendar },
          { label: 'Sick Leaves', total: 10, used: 2, color: '#F59E0B', icon: HeartPulse },
          { label: 'Paid Leaves', total: 15, used: 10, color: '#10B981', icon: Clock },
          { label: 'Unpaid Leaves', total: 0, used: 1, color: '#EF4444', icon: ShieldAlert },
        ].map(bal => (
          <div key={bal.label} className="card p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center pointer-events-none" style={{ background: `${bal.color}15`, color: bal.color }}>
                <bal.icon size={16} />
              </div>
              <p className="text-xs font-700 uppercase tracking-wider text-muted">{bal.label}</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-display font-700 text-primary">{bal.total - bal.used}</p>
                <p className="text-[10px] uppercase font-600 text-muted mt-1">Remaining</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-700" style={{ color: bal.color }}>{bal.used}</p>
                <p className="text-[10px] uppercase font-600 text-muted mt-1">Used</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Filters Content Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {[
            { id: 'attendance', label: 'Attendance Log' },
            { id: 'leaves', label: 'My Leaves' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-600 transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                border: activeTab === tab.id ? '1px solid var(--border-primary)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'leaves' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg border border-primary">
            <Filter size={14} className="text-muted" />
            <select className="bg-transparent text-sm font-600 text-primary border-none outline-none cursor-pointer" value={leaveFilter} onChange={e => setLeaveFilter(e.target.value)}>
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'attendance' && (
        <div className="flex flex-col gap-5">
          {/* Punching Widget */}
          <div className="card p-6 flex flex-col md:flex-row justify-between items-center gap-6" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, transparent 100%)', borderTop: isPunchedIn ? '3px solid #10B981' : '3px solid transparent' }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-0 shadow-lg relative" style={{ background: 'var(--bg-card)', color: isPunchedIn ? '#10B981' : '#0EA5E9', border: '1px solid var(--border-primary)' }}>
                {isPunchedIn ? (
                  <>
                    <div className="absolute inset-0 rounded-2xl animate-ping opacity-20" style={{ background: '#10B981' }}></div>
                    <Square size={24} className="fill-current" />
                  </>
                ) : (
                  <Play size={26} className="fill-current ml-1" />
                )}
              </div>
              <div>
                <p className="text-xl font-display font-700 text-primary mb-1">
                  {isPunchedIn ? 'Currently Clocked In' : 'Ready to Start Working?'}
                </p>
                <p className="text-sm font-600 text-muted">
                  {isPunchedIn ? `Punched in today at ${punchTime}` : 'Punch in to record your attendance for today.'}
                </p>
              </div>
            </div>
            <button 
              onClick={handlePunch}
              className="px-8 py-3 rounded-xl font-700 text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
              style={{ background: isPunchedIn ? '#EF4444' : '#10B981' }}
            >
              {isPunchedIn ? 'Punch Out Now' : 'Punch In Now'}
            </button>
          </div>

          <div className="card overflow-hidden">
            {myAttendance.length === 0 ? (
            <EmptyState icon={Clock} title="No Attendance Logs" description="You have no recorded attendance data yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Working Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.map(record => {
                    const statusColor = record.status === 'Present' ? 'text-emerald-500' : 'text-rose-500';
                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} className="text-muted" />
                            <span className="font-600">{record.date}</span>
                          </div>
                        </td>
                        <td>{record.checkIn}</td>
                        <td>{record.checkOut || '—'}</td>
                        <td>
                          <span className={`font-700 ${statusColor}`}>{record.status}</span>
                        </td>
                        <td>
                          <span className="text-muted">9 hrs</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeaves.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={Calendar} title="No Leave Applications" description="There are no leaves matching your filter." action={<button className="btn-primary mt-2" onClick={() => setShowApplyModal(true)}>Apply Now</button>} />
            </div>
          ) : (
            filteredLeaves.map(leave => (
              <div key={leave.id} className="card p-5 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full \${leave.status === 'approved' ? 'bg-emerald-500' : leave.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-700 text-lg text-primary">{leave.type} Leave</h3>
                    <p className="text-xs text-muted">Applied on {leave.appliedOn}</p>
                  </div>
                  <span className={`text-xs font-700 px-2.5 py-1 rounded-full border uppercase tracking-wider \${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded bg-secondary text-muted">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted font-600">Duration</p>
                    <p className="text-sm font-600 text-primary">{leave.startDate} to {leave.endDate}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-primary">
                  <p className="text-[11px] uppercase tracking-wider text-muted font-600 mb-1">Reason</p>
                  <p className="text-sm text-secondary">{leave.reason}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col gap-6">
        {/* Working Hours Chart */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Working Hours Trend</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Hours logged over the current week</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={WORK_HOURS}>
              <defs>
                <linearGradient id="colorHrs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis hide domain={[0, 12]}/>
              <Tooltip formatter={(v) => [v + ' hrs', 'Worked']} />
              <Area type="monotone" dataKey="hrs" stroke="#10B981" strokeWidth={2.5} fill="url(#colorHrs)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Holidays */}
        <div className="card p-5">
          <h3 className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Upcoming Holidays</h3>
          <div className="flex flex-col gap-4">
            {HOLIDAYS.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center pointer-events-none flex-shrink-0" style={{ background: `${h.color}15`, color: h.color }}>
                    <h.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{h.name}</p>
                    <p className="text-xs font-600" style={{ color: 'var(--text-muted)' }}>{h.type} Holiday</p>
                  </div>
                </div>
                <div className="text-center transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: '6px', padding: '6px 12px' }}>
                  <p className="text-[10px] font-700 uppercase" style={{ color: 'var(--text-muted)' }}>Date</p>
                  <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>{h.date.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Leave">
        <div className="flex flex-col gap-4">
          <FormGroup label="Leave Type" required>
            <select className="select-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option>Sick</option>
              <option>Casual</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Maternity/Paternity</option>
            </select>
          </FormGroup>
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Start Date" required>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </FormGroup>
            <FormGroup label="End Date" required>
              <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            </FormGroup>
          </div>
          <FormGroup label="Reason" required>
            <textarea className="input-field min-h-[100px]" placeholder="Explain why you are requesting this leave..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}></textarea>
          </FormGroup>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button className="btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleApplyLeave}>Submit Request</button>
        </div>
      </Modal>

    </div>
  );
}
