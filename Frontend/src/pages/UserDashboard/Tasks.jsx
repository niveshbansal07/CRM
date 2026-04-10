import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Badge, Modal, FormGroup, ConfirmDialog, EmptyState } from '../../components/common';
import {
  Plus, Search, CheckSquare, Circle, CheckCircle2,
  Clock, Flag, User, Calendar, Filter, Layers,
  AlertTriangle, Zap, ChevronDown, Trash2, Edit2
} from 'lucide-react';

const PRIORITIES = ['high', 'medium', 'low'];
const TYPES      = ['Call', 'Email', 'Meeting', 'Follow-up', 'Demo', 'Proposal', 'Review', 'Other'];
const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#64748B' };

function priorityIcon(priority) {
  if (priority === 'high')   return <Flag size={11} style={{ color: '#EF4444' }} />;
  if (priority === 'medium') return <Flag size={11} style={{ color: '#F59E0B' }} />;
  return <Flag size={11} style={{ color: '#64748B' }} />;
}

export default function UTasks() {
  const { currentCompany, currentUser, tasks, addTask, updateTask, deleteTask } = useAuth();

  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType]   = useState('all');
  const [showAdd, setShowAdd]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode]       = useState('board'); // board | list

  const defaultForm = { title: '', type: 'Call', priority: 'medium', dueDate: '', notes: '', status: 'pending' };
  const [form, setForm] = useState(defaultForm);

  const companyTasks = tasks.filter(t => t.companyId === currentCompany?.id);
  const myTasks = companyTasks.filter(t => !t.assignedTo || t.assignedTo === currentUser?.id);

  const filtered = useMemo(() => myTasks.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus   === 'all' || t.status   === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchType     = filterType     === 'all' || t.type     === filterType;
    return matchSearch && matchStatus && matchPriority && matchType;
  }), [myTasks, search, filterStatus, filterPriority, filterType]);

  const overdueTasks = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
  const dueToday     = myTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const completionRate = myTasks.length ? Math.round((completedTasks.length / myTasks.length) * 100) : 0;

  const handleAdd = () => {
    if (!form.title) return;
    addTask({ ...form, companyId: currentCompany.id, assignedTo: currentUser?.id });
    setShowAdd(false); setForm(defaultForm);
  };

  const handleEdit = () => {
    updateTask(editTarget.id, form);
    setEditTarget(null);
  };

  const openEdit = (t) => { setEditTarget(t); setForm({ ...t }); };

  const toggleStatus = (task) => {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    updateTask(task.id, { ...task, status: next });
  };

  const TaskForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FormGroup label="Task Title" required>
        <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., Follow up with MedPlus contact" />
      </FormGroup>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <FormGroup label="Task Type">
          <select className="select-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Priority">
          <select className="select-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Due Date">
          <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
        </FormGroup>
      </div>
      <FormGroup label="Notes">
        <textarea className="input-field" rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Add context or notes..." style={{ resize: 'vertical' }} />
      </FormGroup>
    </div>
  );

  // Board: group by status columns
  const BOARD_COLS = [
    { id: 'pending',    label: 'To Do',       color: '#6366F1', icon: Circle },
    { id: 'in_progress',label: 'In Progress',  color: '#F59E0B', icon: Zap },
    { id: 'completed',  label: 'Done',         color: '#10B981', icon: CheckCircle2 },
  ];

  const tasksByStatus = (status) => filtered.filter(t => t.status === status);

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <CheckSquare size={14} style={{ color: '#6366F1' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6366F1' }}>Task Manager</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>My Tasks</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {myTasks.length} tasks · {completionRate}% complete
            {overdueTasks.length > 0 && <span style={{ color: '#EF4444', fontWeight: 600 }}> · {overdueTasks.length} overdue</span>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Total Tasks',  value: myTasks.length,          color: '#6366F1' },
          { label: 'To Do',        value: myTasks.filter(t=>t.status==='pending').length, color: '#0EA5E9' },
          { label: 'In Progress',  value: myTasks.filter(t=>t.status==='in_progress').length, color: '#F59E0B' },
          { label: 'Completed',    value: completedTasks.length,   color: '#10B981' },
          { label: 'Overdue 🚨',   value: overdueTasks.length,     color: overdueTasks.length > 0 ? '#EF4444' : '#64748B' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '10px 14px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 5 }}>{k.label}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</p>
              {k.label === 'Completed' && myTasks.length > 0 && (
                <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700 }}>{completionRate}%</span>
              )}
            </div>
            {/* Mini progress bar */}
            {k.label === 'Completed' && (
              <div style={{ height: 3, borderRadius: 2, background: 'var(--border-primary)', marginTop: 6 }}>
                <div style={{ height: '100%', borderRadius: 2, background: '#10B981', width: `${completionRate}%`, transition: 'width 0.5s' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 14 }}>
          <AlertTriangle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
            You have <strong>{overdueTasks.length}</strong> overdue {overdueTasks.length === 1 ? 'task' : 'tasks'} — {overdueTasks.slice(0,2).map(t => t.title).join(', ')}{overdueTasks.length > 2 ? ` +${overdueTasks.length - 2} more` : ''}
          </p>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: 34 }} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-field" style={{ width: 130 }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
        </select>
        <select className="select-field" style={{ width: 130 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
          {['board', 'list'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s',
              background: viewMode === m ? 'var(--bg-card)' : 'transparent', color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
              border: viewMode === m ? '1px solid var(--border-primary)' : '1px solid transparent' }}>
              {m === 'board' ? '⚡ Board' : '📋 List'}
            </button>
          ))}
        </div>
      </div>

      {myTasks.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No Tasks Yet"
          description="Create your first task to stay organized and on top of your work."
          action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Task</button>} />
      ) : viewMode === 'board' ? (
        /* ── BOARD VIEW ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {BOARD_COLS.map(col => {
            const colTasks = tasksByStatus(col.id);
            const ColIcon = col.icon;
            return (
              <div key={col.id}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px 12px 0 0',
                  background: `${col.color}10`, border: `1px solid ${col.color}25`, borderBottom: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <ColIcon size={12} style={{ color: col.color }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: col.color }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${col.color}20`, color: col.color }}>{colTasks.length}</span>
                </div>
                {/* Cards */}
                <div style={{ minHeight: 200, padding: 8, background: 'var(--bg-secondary)', border: `1px solid ${col.color}20`, borderTop: 'none',
                  borderRadius: '0 0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No tasks here</p>
                    </div>
                  ) : colTasks.map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                    const pColor = PRIORITY_COLOR[task.priority] || '#64748B';
                    return (
                      <div key={task.id} className="pipeline-card" style={{ position: 'relative', cursor: 'pointer' }}
                        onDoubleClick={() => openEdit(task)}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '12px 0 0 12px', background: pColor }} />
                        <div style={{ paddingLeft: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <button onClick={() => toggleStatus(task)} style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', marginTop: 1, flexShrink: 0 }}>
                              {task.status === 'completed'
                                ? <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                                : <Circle size={15} style={{ color: 'var(--text-muted)' }} />}
                            </button>
                            <p style={{ fontSize: 12, fontWeight: 600, flex: 1, paddingLeft: 7, color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none', lineHeight: 1.3 }}>
                              {task.title}
                            </p>
                            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                              <button onClick={() => openEdit(task)} style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={11} /></button>
                              <button onClick={() => setDeleteTarget(task)} style={{ padding: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={11} /></button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {priorityIcon(task.priority)}
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'var(--bg-card)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{task.type}</span>
                            </div>
                            {task.dueDate && (
                              <span style={{ fontSize: 9, fontWeight: 700, color: isOverdue ? '#EF4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={9} /> {task.dueDate}
                              </span>
                            )}
                          </div>
                          {task.notes && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic', lineHeight: 1.4 }}>{task.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                  {/* Quick add in column */}
                  <button onClick={() => { setForm({ ...defaultForm, status: col.id }); setShowAdd(true); }}
                    style={{ width: '100%', padding: '8px', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', textAlign: 'center',
                      background: 'transparent', color: 'var(--text-muted)', border: `1px dashed ${col.color}30`, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${col.color}08`; e.currentTarget.style.color = col.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    + Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th></th><th>Task</th><th>Type</th><th>Priority</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
                  return (
                    <tr key={task.id} style={{ opacity: task.status === 'completed' ? 0.6 : 1 }}>
                      <td>
                        <button onClick={() => toggleStatus(task)} style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
                          {task.status === 'completed'
                            ? <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                            : <Circle size={16} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</p>
                        {task.notes && <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{task.notes}</p>}
                      </td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{task.type}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {priorityIcon(task.priority)}
                          <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[task.priority] || '#64748B', textTransform: 'capitalize' }}>{task.priority}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? '#EF4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isOverdue && <AlertTriangle size={11} />} {task.dueDate || '—'}
                        </span>
                      </td>
                      <td><Badge value={task.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => openEdit(task)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Edit2 size={12} /></button>
                          <button onClick={() => setDeleteTarget(task)} style={{ padding: 5, borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Task">
        <TaskForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Create Task</button>
        </div>
      </Modal>
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Task">
        <TaskForm />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
          <button className="btn-primary" onClick={handleEdit}>Save Changes</button>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTask(deleteTarget?.id)} title="Delete Task" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
