import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal, FormGroup } from '../../components/common';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, Tag } from 'lucide-react';

const EVENT_TYPES = ['Meeting', 'Call', 'Demo', 'Follow-up', 'Review', 'Deadline', 'Other'];
const TYPE_COLORS = {
  Meeting:    '#6366F1',
  Call:       '#10B981',
  Demo:       '#0EA5E9',
  'Follow-up':'#F59E0B',
  Review:     '#A855F7',
  Deadline:   '#EF4444',
  Other:      '#64748B',
};

const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Pre-seed events relative to today
function seedEvents(companyId) {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = now.getMonth();
  const d     = now.getDate();
  return [
    { id:'e1', companyId, title:'Q1 Review Meeting',    type:'Review',     date:`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, time:'10:00', attendees:'Arjun, Sanya', notes:'Discuss Q1 KPIs' },
    { id:'e2', companyId, title:'Demo: TechCorp Client', type:'Demo',       date:`${y}-${String(m+1).padStart(2,'0')}-${String(d+1).padStart(2,'0')}`, time:'14:30', attendees:'Kavya', notes:'Product demo for enterprise plan' },
    { id:'e3', companyId, title:'Follow-up: StartupNest',type:'Follow-up',  date:`${y}-${String(m+1).padStart(2,'0')}-${String(d+2).padStart(2,'0')}`, time:'11:00', attendees:'Rohan', notes:'Check on proposal status' },
    { id:'e4', companyId, title:'Board Strategy Call',   type:'Call',       date:`${y}-${String(m+1).padStart(2,'0')}-${String(d+3).padStart(2,'0')}`, time:'09:00', attendees:'All Teams', notes:'Q2 planning' },
    { id:'e5', companyId, title:'MedPlus Contract Deadline', type:'Deadline', date:`${y}-${String(m+1).padStart(2,'0')}-${String(d+5).padStart(2,'0')}`, time:'17:00', attendees:'Legal', notes:'Sign off required' },
  ];
}

export default function CACalendar() {
  const { currentCompany, tasks } = useAuth();

  const todayObj = new Date();
  const [year,  setYear]  = useState(todayObj.getFullYear());
  const [month, setMonth] = useState(todayObj.getMonth());
  const [events, setEvents] = useState(() => seedEvents(currentCompany?.id));
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const defaultForm = { title:'', type:'Meeting', date:'', time:'', attendees:'', notes:'' };
  const [form, setForm] = useState(defaultForm);

  // Combine CRM events + tasks with dueDate as events
  const companyEvents = useMemo(() => [
    ...events.filter(e => e.companyId === currentCompany?.id),
    ...(tasks || [])
      .filter(t => t.companyId === currentCompany?.id && t.dueDate)
      .map(t => ({ id:`task-${t.id}`, companyId: t.companyId, title: t.title, type: t.type || 'Other', date: t.dueDate, time:'', isTask: true })),
  ], [events, tasks, currentCompany]);

  // Days in month
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstDayOfWk = new Date(year, month, 1).getDay();
  const days = [...Array(firstDayOfWk).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const eventsForDay = (d) => {
    if (!d) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return companyEvents.filter(e => e.date === dateStr);
  };

  const isToday = (d) => d === todayObj.getDate() && month === todayObj.getMonth() && year === todayObj.getFullYear();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y+1); } else setMonth(m => m+1); };

  const openAdd = (d) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    setForm({ ...defaultForm, date: dateStr });
    setShowAdd(true);
  };

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    setEvents(prev => [...prev, { ...form, id:`e${Date.now()}`, companyId: currentCompany?.id }]);
    setShowAdd(false); setForm(defaultForm);
  };

  // Upcoming events (next 7 days)
  const upcoming = companyEvents.filter(e => {
    const d = new Date(e.date);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = (d - now) / 86400000;
    return diff >= 0 && diff <= 7;
  }).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7);

  const EventForm = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <FormGroup label="Event Title" required>
        <input className="input-field" value={form.title} onChange={e => setForm({...form, title:e.target.value})} placeholder="e.g., Demo with TechCorp" />
      </FormGroup>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
        <FormGroup label="Type">
          <select className="select-field" value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
            {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Date">
          <input className="input-field" type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} />
        </FormGroup>
        <FormGroup label="Time">
          <input className="input-field" type="time" value={form.time} onChange={e => setForm({...form, time:e.target.value})} />
        </FormGroup>
      </div>
      <FormGroup label="Attendees">
        <input className="input-field" value={form.attendees} onChange={e => setForm({...form, attendees:e.target.value})} placeholder="Arjun, Kavya, Rohan..." />
      </FormGroup>
      <FormGroup label="Notes">
        <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="Agenda or context..." style={{ resize:'vertical' }} />
      </FormGroup>
    </div>
  );

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <CalIcon size={14} style={{ color:'#6366F1' }} />
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#6366F1' }}>Schedule</span>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:'var(--text-primary)' }}>Calendar</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>
            {upcoming.length} events in the next 7 days
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Event</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:16 }}>
        {/* ── CALENDAR GRID ── */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {/* Month nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--border-primary)' }}>
            <button onClick={prevMonth} style={{ padding:6, borderRadius:8, background:'var(--bg-secondary)', border:'1px solid var(--border-primary)', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
              <ChevronLeft size={15} />
            </button>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{MONTHS[month]}</p>
              <p style={{ fontSize:11, color:'var(--text-muted)' }}>{year}</p>
            </div>
            <button onClick={nextMonth} style={{ padding:6, borderRadius:8, background:'var(--bg-secondary)', border:'1px solid var(--border-primary)', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', padding:'10px 16px 6px' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'4px 0' }}>
                {w}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:1, padding:'0 16px 16px', background:'var(--bg-card)' }}>
            {days.map((d, i) => {
              const dayEvents = eventsForDay(d);
              const today = d && isToday(d);
              return (
                <div key={i} onClick={() => d && openAdd(d)}
                  style={{ minHeight:72, padding:'6px 6px 4px', borderRadius:8, background: today ? 'rgba(99,102,241,0.08)' : 'transparent',
                    border: today ? '1.5px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    cursor: d ? 'pointer' : 'default', transition:'all 0.12s' }}
                  onMouseEnter={e => { if (d) e.currentTarget.style.background = today ? 'rgba(99,102,241,0.12)' : 'var(--bg-secondary)'; }}
                  onMouseLeave={e => { if (d) e.currentTarget.style.background = today ? 'rgba(99,102,241,0.08)' : 'transparent'; }}>

                  {d && (
                    <>
                      <p style={{ fontSize:12, fontWeight: today ? 800 : 500, color: today ? '#6366F1' : 'var(--text-secondary)', marginBottom:3, textAlign:'center' }}>
                        {d}
                        {today && <span style={{ fontSize:8, display:'block', color:'#6366F1', fontWeight:700, letterSpacing:'0.06em' }}>TODAY</span>}
                      </p>
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        {dayEvents.slice(0, 2).map(ev => (
                          <div key={ev.id} onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                            style={{ fontSize:9, fontWeight:700, padding:'2px 5px', borderRadius:4,
                              background: `${TYPE_COLORS[ev.type] || '#64748B'}20`,
                              color: TYPE_COLORS[ev.type] || '#64748B',
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer' }}>
                            {ev.isTask && '⊡ '}{ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p style={{ fontSize:8, color:'var(--text-muted)', fontWeight:700, paddingLeft:3 }}>+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SIDEBAR: Upcoming ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Legend */}
          <div className="card" style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Event Types</p>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:color, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="card" style={{ padding:'14px 16px', flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Upcoming (7 days)</p>
            {upcoming.length === 0 ? (
              <p style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic', textAlign:'center', paddingTop:8 }}>No upcoming events</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {upcoming.map(ev => {
                  const color = TYPE_COLORS[ev.type] || '#64748B';
                  const evDate = new Date(ev.date);
                  const isEv = evDate.toDateString() === todayObj.toDateString();
                  return (
                    <div key={ev.id} style={{ padding:'9px 10px', borderRadius:10, background:`${color}08`, border:`1px solid ${color}20`, cursor:'pointer', transition:'all 0.15s' }}
                      onClick={() => setSelectedEvent(ev)}
                      onMouseEnter={e => e.currentTarget.style.background=`${color}14`}
                      onMouseLeave={e => e.currentTarget.style.background=`${color}08`}>
                      <div style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:color, marginTop:4, flexShrink:0 }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ev.title}</p>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                            <span style={{ fontSize:10, color:'var(--text-muted)' }}>
                              {isEv ? 'Today' : evDate.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                            </span>
                            {ev.time && <span style={{ fontSize:10, color, fontWeight:700 }}>{ev.time}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick add today */}
          <button onClick={() => openAdd(todayObj.getDate())} className="btn-secondary" style={{ width:'100%', justifyContent:'center' }}>
            <Plus size={13} /> Add Today's Event
          </button>
        </div>
      </div>

      {/* Add event modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Event" width={520}>
        <EventForm />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:18 }}>
          <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleAdd}>Create Event</button>
        </div>
      </Modal>

      {/* Event detail modal */}
      {selectedEvent && (
        <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent.title} width={420}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:`${TYPE_COLORS[selectedEvent.type]||'#64748B'}15`, color:TYPE_COLORS[selectedEvent.type]||'#64748B' }}>
                {selectedEvent.type}
              </span>
              {selectedEvent.isTask && <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'rgba(99,102,241,0.1)', color:'#6366F1' }}>📋 Task</span>}
            </div>
            {[
              { icon: CalIcon,  label:'Date',      value: selectedEvent.date },
              { icon: Clock,    label:'Time',      value: selectedEvent.time || '—' },
              { icon: User,     label:'Attendees', value: selectedEvent.attendees || '—' },
              { icon: Tag,      label:'Notes',     value: selectedEvent.notes || '—' },
            ].map(r => {
              const Icon = r.icon;
              return (
                <div key={r.label} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'9px 12px', borderRadius:10, background:'var(--bg-secondary)' }}>
                  <Icon size={13} style={{ color:'var(--text-muted)', flexShrink:0, marginTop:1 }} />
                  <div>
                    <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', marginBottom:2 }}>{r.label}</p>
                    <p style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>{r.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:18 }}>
            <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>Close</button>
            {!selectedEvent.isTask && (
              <button className="btn-danger" onClick={() => { setEvents(prev => prev.filter(e => e.id !== selectedEvent.id)); setSelectedEvent(null); }}
                style={{ padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.3)' }}>
                Delete Event
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}