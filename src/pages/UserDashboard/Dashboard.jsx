import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge, StatCard } from '../../components/common';
import {
  TrendingUp, Layers, CheckSquare, Target, Phone, Mail, ArrowRight,
  Users, DollarSign, Award, Activity, AlertCircle, CheckCircle2,
  BarChart2, Flame, UserCheck, CreditCard, FileText, TrendingDown,
  MessageSquare, Timer, Star,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from 'recharts';

const ChartTip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl px-3 py-2" style={{ background: '#111827', border: '1px solid #1E2D45' }}>
        <p className="text-xs mb-1" style={{ color: '#64748B' }}>{label}</p>
        <p className="text-sm font-700" style={{ color: payload[0]?.color || '#0EA5E9' }}>{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

/* ─────────────────── SALES DASHBOARD ─────────────────── */
function SalesDashboard({ currentUser, leads, deals, tasks }) {
  const navigate   = useNavigate();
  const myLeads    = leads.filter(l => l.assignedTo === currentUser?.id);
  const myDeals    = deals.filter(d => d.assignedTo === currentUser?.id);
  const myTasks    = tasks.filter(t => t.assignedTo === currentUser?.id && t.status === 'pending');
  const wonDeals   = myDeals.filter(d => d.stage === 'Closed Won');
  const wonValue   = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const pipeValue  = myDeals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage)).reduce((s,d)=>s+(d.value||0),0);
  const target     = 500000;
  const progress   = Math.min(Math.round((wonValue / target) * 100), 100);
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayTasks = myTasks.filter(t => t.dueDate === todayStr);
  const overdue    = myTasks.filter(t => new Date(t.dueDate) < new Date()).length;

  const leadFunnel = [
    { stage:'New',       count: myLeads.filter(l=>l.status==='new').length,      color:'#0EA5E9' },
    { stage:'Contacted', count: myLeads.filter(l=>l.status==='contacted').length, color:'#6366F1' },
    { stage:'Qualified', count: myLeads.filter(l=>l.status==='qualified').length, color:'#F59E0B' },
    { stage:'Proposal',  count: myLeads.filter(l=>l.status==='proposal').length,  color:'#A855F7' },
  ];

  const WEEKLY = [
    { day:'Mon',calls:4,emails:7},{ day:'Tue',calls:6,emails:5},
    { day:'Wed',calls:3,emails:9},{ day:'Thu',calls:8,emails:6},
    { day:'Fri',calls:5,emails:4},{ day:'Sat',calls:2,emails:3},
  ];

  const barColor = progress >= 80 ? '#10B981' : progress >= 50 ? '#F59E0B' : '#0EA5E9';

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} style={{color:'#F59E0B'}}/>
            <span className="text-xs font-700 uppercase tracking-widest" style={{color:'#F59E0B'}}>Sales Dashboard</span>
          </div>
          <h1 className="font-display font-700 text-3xl tracking-wide" style={{color:'var(--text-primary)'}}>
            Let's close deals, {currentUser?.name?.split(' ')[0]}! 🎯
          </h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
            {new Date().toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})} · Keep pushing!
          </p>
        </div>
        <button onClick={()=>navigate('/user/profile')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600 transition-all"
          style={{background:'rgba(245,158,11,0.1)',color:'#F59E0B',border:'1px solid rgba(245,158,11,0.2)'}}>
          <UserCheck size={15}/> My Profile
        </button>
      </div>

      {/* Target Banner */}
      <div className="card p-5 mb-5" style={{background:'linear-gradient(135deg,rgba(14,165,233,0.06),rgba(99,102,241,0.06))',borderColor:'rgba(14,165,233,0.2)'}}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-700 uppercase tracking-widest mb-1" style={{color:'var(--text-muted)'}}>Monthly Revenue Target</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-700 text-2xl" style={{color:'var(--text-primary)'}}>₹{wonValue.toLocaleString()}</span>
              <span className="text-sm" style={{color:'var(--text-muted)'}}>&nbsp;/ ₹{target.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display font-700 text-4xl" style={{color:barColor}}>{progress}%</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>of target</p>
          </div>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{background:'rgba(14,165,233,0.1)'}}>
          <div className="h-full rounded-full transition-all" style={{width:`${progress}%`,background:`linear-gradient(90deg,${barColor},${barColor}88)`}}></div>
        </div>
        <p className="text-xs mt-2 font-600" style={{color:'var(--text-muted)'}}>
          ₹{Math.max(0,target-wonValue).toLocaleString()} remaining
          {progress>=100 && <span className="ml-2 px-2 py-0.5 rounded-full font-700" style={{background:'rgba(16,185,129,0.2)',color:'#10B981'}}>🎉 Target Hit!</span>}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard title="My Leads" value={myLeads.length} subtitle={`${myLeads.filter(l=>l.status==='new').length} new`} icon={TrendingUp} accentColor="#0EA5E9" trend={12}/>
        <StatCard title="Active Deals" value={myDeals.filter(d=>!['Closed Won','Closed Lost'].includes(d.stage)).length} subtitle={`₹${(pipeValue/1000).toFixed(0)}K pipeline`} icon={Layers} accentColor="#6366F1"/>
        <StatCard title="Won This Month" value={wonDeals.length} subtitle={`₹${(wonValue/1000).toFixed(0)}K revenue`} icon={Award} accentColor="#10B981" trend={22}/>
        <StatCard title="Tasks Due" value={myTasks.length} subtitle={overdue>0?`⚠ ${overdue} overdue`:'on track'} icon={CheckSquare} accentColor={overdue>0?'#EF4444':'#F59E0B'}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Funnel */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-4" style={{color:'var(--text-primary)'}}>My Lead Funnel</p>
          <div className="flex flex-col gap-3">
            {leadFunnel.map(s=>(
              <div key={s.stage}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-600" style={{color:'var(--text-secondary)'}}>{s.stage}</span>
                  <span className="text-xs font-700" style={{color:s.color}}>{s.count}</span>
                </div>
                <div className="h-2.5 rounded-full" style={{background:'var(--border-primary)'}}>
                  <div className="h-full rounded-full" style={{width:`${myLeads.length?(s.count/myLeads.length)*100:0}%`,background:s.color}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 grid grid-cols-2 gap-3" style={{borderTop:'1px solid var(--border-primary)'}}>
            <div>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>Conv. Rate</p>
              <p className="font-700 text-base" style={{color:'#0EA5E9'}}>{myLeads.length?Math.round((wonDeals.length/myLeads.length)*100):0}%</p>
            </div>
            <div>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>Avg Deal</p>
              <p className="font-700 text-base" style={{color:'#10B981'}}>₹{wonDeals.length?Math.round(wonValue/wonDeals.length).toLocaleString():0}</p>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{color:'var(--text-primary)'}}>This Week's Activity</p>
          <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>Calls and emails logged</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY} barGap={2}>
              <XAxis dataKey="day" tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="calls" name="Calls" fill="#0EA5E9" radius={[3,3,0,0]}/>
              <Bar dataKey="emails" name="Emails" fill="#6366F1" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:'#0EA5E9'}}></div><span className="text-xs" style={{color:'var(--text-muted)'}}>Calls</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{background:'#6366F1'}}></div><span className="text-xs" style={{color:'var(--text-muted)'}}>Emails</span></div>
          </div>
        </div>

        {/* Today's tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-700" style={{color:'var(--text-primary)'}}>Today's Plan</p>
            <button onClick={()=>navigate('/user/tasks')} className="text-xs font-600" style={{color:'#0EA5E9'}}>View all →</button>
          </div>
          {todayTasks.length===0?(
            <div className="flex flex-col items-center py-6">
              <CheckCircle2 size={32} style={{color:'#10B981',opacity:0.5}}/>
              <p className="text-sm font-600 mt-3" style={{color:'var(--text-primary)'}}>All clear!</p>
              <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>No tasks due today</p>
            </div>
          ):(
            <div className="flex flex-col gap-2">
              {todayTasks.slice(0,4).map(t=>{
                const tc={Call:'#10B981',Email:'#0EA5E9',Meeting:'#A855F7',Task:'#64748B'};
                return(
                  <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{background:'var(--bg-secondary)',border:'1px solid var(--border-primary)'}}>
                    <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{background:tc[t.type]||'#64748B'}}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-600 truncate" style={{color:'var(--text-primary)'}}>{t.title}</p>
                      <p className="text-xs" style={{color:tc[t.type]||'#64748B'}}>{t.type}</p>
                    </div>
                    <Badge value={t.priority}/>
                  </div>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={()=>navigate('/user/leads')} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-700"
              style={{background:'rgba(14,165,233,0.1)',color:'#0EA5E9',border:'1px solid rgba(14,165,233,0.2)'}}>
              <TrendingUp size={13}/> Leads
            </button>
            <button onClick={()=>navigate('/user/deals')} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-700"
              style={{background:'rgba(99,102,241,0.1)',color:'#6366F1',border:'1px solid rgba(99,102,241,0.2)'}}>
              <Layers size={13}/> Deals
            </button>
          </div>
        </div>
      </div>

      {/* Hot Leads */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid var(--border-primary)'}}>
          <div className="flex items-center gap-2">
            <Flame size={15} style={{color:'#EF4444'}}/>
            <p className="text-sm font-700" style={{color:'var(--text-primary)'}}>Hot Leads — Act Now</p>
          </div>
          <button onClick={()=>navigate('/user/leads')} className="btn-secondary text-xs">View All <ArrowRight size={12}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Lead</th><th>Contact</th><th>Value</th><th>Status</th><th>Last Touch</th><th>Actions</th></tr></thead>
            <tbody>
              {myLeads.filter(l=>l.priority==='high'||l.status==='proposal').slice(0,5).map(l=>(
                <tr key={l.id}>
                  <td><div><p className="font-700 text-sm" style={{color:'var(--text-primary)'}}>{l.name}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{l.source}</p></div></td>
                  <td style={{fontSize:12}}>{l.contact}</td>
                  <td><span className="font-mono text-xs font-700" style={{color:'#10B981'}}>₹{l.value?.toLocaleString()}</span></td>
                  <td><Badge value={l.status}/></td>
                  <td style={{fontSize:12}}>{l.lastContact}</td>
                  <td>
                    <div className="flex gap-1">
                      <a href={`tel:${l.phone}`} className="p-1.5 rounded-lg" style={{background:'rgba(16,185,129,0.1)',color:'#10B981'}}><Phone size={13}/></a>
                      <a href={`mailto:${l.email}`} className="p-1.5 rounded-lg" style={{background:'rgba(14,165,233,0.1)',color:'#0EA5E9'}}><Mail size={13}/></a>
                    </div>
                  </td>
                </tr>
              ))}
              {myLeads.filter(l=>l.priority==='high'||l.status==='proposal').length===0&&(
                <tr><td colSpan={6} className="text-center py-8" style={{color:'var(--text-muted)',fontSize:13}}>No high-priority leads. Keep adding leads!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── MANAGER DASHBOARD ─────────────────── */
function ManagerDashboard({ currentUser, currentCompany, leads, deals, tasks, users }) {
  const navigate     = useNavigate();
  const teamMembers  = users.filter(u=>u.companyId===currentCompany?.id&&u.role==='sales');
  const companyDeals = deals.filter(d=>d.companyId===currentCompany?.id);
  const companyLeads = leads.filter(l=>l.companyId===currentCompany?.id);
  const companyTasks = tasks.filter(t=>t.companyId===currentCompany?.id);
  const wonDeals     = companyDeals.filter(d=>d.stage==='Closed Won');
  const pipeValue    = companyDeals.filter(d=>!['Closed Won','Closed Lost'].includes(d.stage)).reduce((s,d)=>s+(d.value||0),0);
  const wonValue     = wonDeals.reduce((s,d)=>s+(d.value||0),0);
  const overdueTask  = companyTasks.filter(t=>t.status==='pending'&&new Date(t.dueDate)<new Date()).length;

  const leaderboard = teamMembers.map(u=>({
    ...u,
    leadsCount: leads.filter(l=>l.assignedTo===u.id).length,
    dealsWon:   deals.filter(d=>d.assignedTo===u.id&&d.stage==='Closed Won').length,
    revenue:    deals.filter(d=>d.assignedTo===u.id&&d.stage==='Closed Won').reduce((s,d)=>s+(d.value||0),0),
    tasksDone:  tasks.filter(t=>t.assignedTo===u.id&&t.status==='completed').length,
  })).sort((a,b)=>b.revenue-a.revenue);

  const PIPE_STAGES=['Discovery','Qualified','Proposal','Negotiation'].map(stage=>({
    stage, count:companyDeals.filter(d=>d.stage===stage).length,
    value:companyDeals.filter(d=>d.stage===stage).reduce((s,d)=>s+(d.value||0),0),
  }));
  const STAGECOLORS=['#0EA5E9','#6366F1','#F59E0B','#A855F7'];

  const WEEKLY_L=[{week:'W1',leads:8},{week:'W2',leads:14},{week:'W3',leads:11},{week:'W4',leads:18},{week:'W5',leads:companyLeads.length}];

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={16} style={{color:'#0EA5E9'}}/>
            <span className="text-xs font-700 uppercase tracking-widest" style={{color:'#0EA5E9'}}>Manager Dashboard</span>
          </div>
          <h1 className="font-display font-700 text-3xl tracking-wide" style={{color:'var(--text-primary)'}}>
            Team Overview, {currentUser?.name?.split(' ')[0]} 📊
          </h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
            {teamMembers.length} sales reps · {companyLeads.length} leads · Pipeline health
          </p>
        </div>
        <button onClick={()=>navigate('/user/profile')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600"
          style={{background:'rgba(14,165,233,0.1)',color:'#0EA5E9',border:'1px solid rgba(14,165,233,0.2)'}}>
          <UserCheck size={15}/> My Profile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard title="Team Size" value={teamMembers.length} subtitle="sales reps" icon={Users} accentColor="#0EA5E9"/>
        <StatCard title="Pipeline" value={`₹${(pipeValue/1000).toFixed(0)}K`} subtitle={`${companyDeals.filter(d=>!['Closed Won','Closed Lost'].includes(d.stage)).length} deals`} icon={Layers} accentColor="#6366F1" trend={18}/>
        <StatCard title="Revenue Won" value={`₹${(wonValue/1000).toFixed(0)}K`} subtitle={`${wonDeals.length} closed`} icon={Award} accentColor="#10B981" trend={24}/>
        <StatCard title="Overdue Tasks" value={overdueTask} subtitle="need attention" icon={AlertCircle} accentColor={overdueTask>0?'#EF4444':'#10B981'}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <p className="text-sm font-700 mb-4" style={{color:'var(--text-primary)'}}>Pipeline by Stage</p>
          <div className="flex flex-col gap-3">
            {PIPE_STAGES.map((p,i)=>{
              const max=Math.max(...PIPE_STAGES.map(x=>x.value),1);
              return(
                <div key={p.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-600" style={{color:'var(--text-secondary)'}}>{p.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-700" style={{color:STAGECOLORS[i]}}>{p.count}</span>
                      <span className="font-mono text-xs" style={{color:'var(--text-muted)'}}>₹{(p.value/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full" style={{background:'var(--border-primary)'}}>
                    <div className="h-full rounded-full" style={{width:`${(p.value/max)*100}%`,background:STAGECOLORS[i]}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{color:'var(--text-primary)'}}>Lead Inflow Trend</p>
          <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>Weekly new leads</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={WEEKLY_L}>
              <defs>
                <linearGradient id="mgrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="leads" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#mgrGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card overflow-hidden mb-5">
        <div className="flex items-center gap-2 px-5 py-4" style={{borderBottom:'1px solid var(--border-primary)'}}>
          <Star size={15} style={{color:'#F59E0B'}}/>
          <p className="text-sm font-700" style={{color:'var(--text-primary)'}}>Team Leaderboard</p>
        </div>
        {leaderboard.length===0?(
          <div className="py-8 text-center"><p className="text-sm" style={{color:'var(--text-muted)'}}>No sales reps yet. Add employees in the Company Admin panel.</p></div>
        ):(
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Rep</th><th>Leads</th><th>Won</th><th>Revenue</th><th>Performance</th></tr></thead>
              <tbody>
                {leaderboard.map((rep,i)=>{
                  const maxR=Math.max(...leaderboard.map(r=>r.revenue),1);
                  const pct=Math.round((rep.revenue/maxR)*100);
                  const medals=['🥇','🥈','🥉'];
                  return(
                    <tr key={rep.id}>
                      <td><span className="font-display font-700 text-lg" style={{color:i<3?'#F59E0B':'var(--text-muted)'}}>{medals[i]||`#${i+1}`}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                            style={{background:'linear-gradient(135deg,#0EA5E9,#6366F1)',color:'white'}}>{rep.avatar}</div>
                          <div>
                            <p className="font-600 text-sm" style={{color:'var(--text-primary)'}}>{rep.name}</p>
                            <p style={{fontSize:11,color:'var(--text-muted)'}}>{rep.department}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{fontWeight:600,color:'var(--text-primary)'}}>{rep.leadsCount}</td>
                      <td style={{fontWeight:600,color:'#10B981'}}>{rep.dealsWon}</td>
                      <td><span className="font-mono text-xs font-700" style={{color:'#10B981'}}>₹{rep.revenue.toLocaleString()}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full" style={{background:'var(--border-primary)',width:80}}>
                            <div className="h-full rounded-full" style={{width:`${pct}%`,background:'linear-gradient(90deg,#0EA5E9,#6366F1)'}}></div>
                          </div>
                          <span className="text-xs font-600" style={{color:'#0EA5E9'}}>{pct}%</span>
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
    </div>
  );
}

/* ─────────────────── SUPPORT DASHBOARD ─────────────────── */
function SupportDashboard({ currentUser }) {
  const navigate = useNavigate();
  const TICKETS=[
    {id:'tk1',title:'Login issue — client portal',  priority:'high',  status:'open',        customer:'TechCorp',    sla:'2h', created:'2025-01-12'},
    {id:'tk2',title:'Data export not working',      priority:'medium',status:'in-progress', customer:'StartupNest', sla:'8h', created:'2025-01-11'},
    {id:'tk3',title:'Invoice not generated',        priority:'low',   status:'resolved',    customer:'MedPlus',     sla:'✓',  created:'2025-01-10'},
    {id:'tk4',title:'Password reset request',       priority:'low',   status:'open',        customer:'CloudBase',   sla:'24h',created:'2025-01-12'},
    {id:'tk5',title:'API integration failing',      priority:'high',  status:'open',        customer:'FinVault',    sla:'1h', created:'2025-01-12'},
  ];
  const open=TICKETS.filter(t=>t.status==='open').length;
  const inProg=TICKETS.filter(t=>t.status==='in-progress').length;
  const resolved=TICKETS.filter(t=>t.status==='resolved').length;
  const critical=TICKETS.filter(t=>t.priority==='high'&&t.status!=='resolved').length;

  const RESP_DATA=[
    {day:'Mon',time:2.1},{day:'Tue',time:1.8},{day:'Wed',time:3.2},
    {day:'Thu',time:1.5},{day:'Fri',time:2.4},{day:'Sat',time:1.2},
  ];
  const CSAT=[{name:'csat',value:78,fill:'#10B981'}];
  const statusC={'open':'#EF4444','in-progress':'#F59E0B','resolved':'#10B981'};
  const priorityC={high:'#EF4444',medium:'#F59E0B',low:'#64748B'};

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} style={{color:'#6366F1'}}/>
            <span className="text-xs font-700 uppercase tracking-widest" style={{color:'#6366F1'}}>Support Dashboard</span>
          </div>
          <h1 className="font-display font-700 text-3xl tracking-wide" style={{color:'var(--text-primary)'}}>
            Support Queue, {currentUser?.name?.split(' ')[0]} 🎫
          </h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
            {open} open · {critical} critical · Resolution rate: {Math.round((resolved/TICKETS.length)*100)}%
          </p>
        </div>
        <button onClick={()=>navigate('/user/profile')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600"
          style={{background:'rgba(99,102,241,0.1)',color:'#6366F1',border:'1px solid rgba(99,102,241,0.2)'}}>
          <UserCheck size={15}/> My Profile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard title="Open Tickets" value={open} subtitle="awaiting response" icon={MessageSquare} accentColor="#EF4444"/>
        <StatCard title="In Progress" value={inProg} subtitle="being handled" icon={Timer} accentColor="#F59E0B"/>
        <StatCard title="Resolved" value={resolved} subtitle="closed today" icon={CheckCircle2} accentColor="#10B981" trend={15}/>
        <StatCard title="Critical" value={critical} subtitle="high priority open" icon={AlertCircle} accentColor={critical>0?'#EF4444':'#10B981'}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-700 mb-1" style={{color:'var(--text-primary)'}}>Avg Response Time (hours)</p>
          <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>Target: under 2 hours</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={RESP_DATA}>
              <defs>
                <linearGradient id="suppGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<ChartTip/>}/>
              <Area type="monotone" dataKey="time" stroke="#6366F1" strokeWidth={2.5} fill="url(#suppGrad)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <p className="text-sm font-700 mb-4" style={{color:'var(--text-primary)'}}>Customer Satisfaction</p>
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={CSAT} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={6}/>
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-display font-700 text-2xl" style={{color:'#10B981'}}>78%</p>
                <p style={{fontSize:9,color:'var(--text-muted)',fontWeight:700}}>CSAT</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 w-full">
              {[{label:'😊 Happy',pct:78,color:'#10B981'},{label:'😐 Neutral',pct:15,color:'#F59E0B'},{label:'😞 Unhappy',pct:7,color:'#EF4444'}].map(s=>(
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{color:'var(--text-muted)'}}>{s.label}</span>
                    <span style={{color:s.color,fontWeight:700}}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{background:'var(--border-primary)'}}>
                    <div className="h-full rounded-full" style={{width:`${s.pct}%`,background:s.color}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid var(--border-primary)'}}>
          <div className="flex items-center gap-2">
            <AlertCircle size={15} style={{color:'#EF4444'}}/>
            <p className="text-sm font-700" style={{color:'var(--text-primary)'}}>Live Ticket Queue</p>
          </div>
          <button onClick={()=>navigate('/user/tickets')} className="btn-secondary text-xs">Manage All <ArrowRight size={12}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Ticket</th><th>Customer</th><th>Priority</th><th>Status</th><th>SLA</th></tr></thead>
            <tbody>
              {TICKETS.filter(t=>t.status!=='resolved').map(t=>(
                <tr key={t.id}>
                  <td><p className="font-600 text-sm" style={{color:'var(--text-primary)'}}>{t.title}</p></td>
                  <td style={{fontSize:12}}>{t.customer}</td>
                  <td><span className="badge" style={{background:`${priorityC[t.priority]}15`,color:priorityC[t.priority]}}>{t.priority}</span></td>
                  <td><span className="badge" style={{background:`${statusC[t.status]}12`,color:statusC[t.status]}}>{t.status}</span></td>
                  <td><span className="font-mono text-xs font-700" style={{color:t.sla.includes('h')?'#F59E0B':'#10B981'}}>{t.sla}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── FINANCE DASHBOARD ─────────────────── */
function FinanceDashboard({ currentUser, currentCompany, deals, payments }) {
  const navigate        = useNavigate();
  const companyPayments = payments.filter(p=>p.companyId===currentCompany?.id);
  const companyDeals    = deals.filter(d=>d.companyId===currentCompany?.id);
  const totalCollected  = companyPayments.filter(p=>p.status==='paid').reduce((s,p)=>s+p.amount,0);
  const totalPending    = companyPayments.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0);
  const totalOverdue    = companyPayments.filter(p=>p.status==='overdue').reduce((s,p)=>s+p.amount,0);
  const wonRevenue      = companyDeals.filter(d=>d.stage==='Closed Won').reduce((s,d)=>s+(d.value||0),0);

  const MONTHLY=[
    {month:'Sep',collected:48000,pending:12000},
    {month:'Oct',collected:62000,pending:8000},
    {month:'Nov',collected:55000,pending:15000},
    {month:'Dec',collected:78000,pending:9000},
    {month:'Jan',collected:totalCollected,pending:totalPending},
  ];

  const PAY_STAT=[
    {label:'Paid',    v:companyPayments.filter(p=>p.status==='paid').length,    color:'#10B981'},
    {label:'Pending', v:companyPayments.filter(p=>p.status==='pending').length,  color:'#F59E0B'},
    {label:'Overdue', v:companyPayments.filter(p=>p.status==='overdue').length,  color:'#EF4444'},
  ];

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} style={{color:'#10B981'}}/>
            <span className="text-xs font-700 uppercase tracking-widest" style={{color:'#10B981'}}>Finance Dashboard</span>
          </div>
          <h1 className="font-display font-700 text-3xl tracking-wide" style={{color:'var(--text-primary)'}}>
            Financial Overview, {currentUser?.name?.split(' ')[0]} 💰
          </h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
            {companyPayments.length} invoices · Revenue and payment health
          </p>
        </div>
        <button onClick={()=>navigate('/user/profile')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600"
          style={{background:'rgba(16,185,129,0.1)',color:'#10B981',border:'1px solid rgba(16,185,129,0.2)'}}>
          <UserCheck size={15}/> My Profile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard title="Collected" value={`₹${(totalCollected/1000).toFixed(0)}K`} icon={DollarSign} accentColor="#10B981" trend={18}/>
        <StatCard title="Pending" value={`₹${(totalPending/1000).toFixed(0)}K`} subtitle={`${companyPayments.filter(p=>p.status==='pending').length} invoices`} icon={FileText} accentColor="#F59E0B"/>
        <StatCard title="Overdue" value={`₹${(totalOverdue/1000).toFixed(0)}K`} subtitle="requires action" icon={TrendingDown} accentColor={totalOverdue>0?'#EF4444':'#10B981'}/>
        <StatCard title="Deal Revenue" value={`₹${(wonRevenue/1000).toFixed(0)}K`} subtitle="all won deals" icon={Award} accentColor="#A855F7" trend={22}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-700 mb-1" style={{color:'var(--text-primary)'}}>Monthly Revenue Trend</p>
          <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>Collected vs pending</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} barGap={4}>
              <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4,4,0,0]}/>
              <Bar dataKey="pending"   name="Pending"   fill="#F59E0B" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:'#10B981'}}></div><span className="text-xs" style={{color:'var(--text-muted)'}}>Collected</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:'#F59E0B'}}></div><span className="text-xs" style={{color:'var(--text-muted)'}}>Pending</span></div>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-700 mb-4" style={{color:'var(--text-primary)'}}>Invoice Status</p>
          <div className="flex flex-col gap-3 mb-4">
            {PAY_STAT.map(s=>(
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-600" style={{color:'var(--text-secondary)'}}>{s.label}</span>
                  <span className="text-xs font-700" style={{color:s.color}}>{s.v}</span>
                </div>
                <div className="h-2 rounded-full" style={{background:'var(--border-primary)'}}>
                  <div className="h-full rounded-full" style={{width:`${companyPayments.length?(s.v/companyPayments.length)*100:0}%`,background:s.color}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4" style={{borderTop:'1px solid var(--border-primary)'}}>
            <p className="text-xs font-700 mb-1" style={{color:'var(--text-muted)'}}>Collection Rate</p>
            <p className="font-display font-700 text-2xl" style={{color:'#10B981'}}>
              {companyPayments.length?Math.round((companyPayments.filter(p=>p.status==='paid').length/companyPayments.length)*100):0}%
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid var(--border-primary)'}}>
          <div className="flex items-center gap-2">
            <CreditCard size={15} style={{color:'#10B981'}}/>
            <p className="text-sm font-700" style={{color:'var(--text-primary)'}}>Invoice Tracker</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>For</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {companyPayments.length===0?(
                <tr><td colSpan={5} className="text-center py-8" style={{color:'var(--text-muted)',fontSize:13}}>No invoices yet.</td></tr>
              ):companyPayments.map(p=>(
                <tr key={p.id}>
                  <td><span className="font-mono text-xs font-600" style={{color:'#0EA5E9'}}>{p.invoiceNo}</span></td>
                  <td><p className="font-600 text-sm" style={{color:'var(--text-primary)'}}>{p.dealName}</p></td>
                  <td><span className="font-mono text-sm font-700" style={{color:'#10B981'}}>₹{p.amount?.toLocaleString()}</span></td>
                  <td><Badge value={p.status}/></td>
                  <td style={{fontSize:12}}>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────── HUMAN RESOURCE DASHBOARD ─────────────────── */
function HumanResourceDashboard({ currentUser, currentCompany, leads, deals, tasks, users }) {
  const navigate = useNavigate();
  const teamMembers = users.filter(u => u.companyId === currentCompany?.id && u.role === 'sales');
  const companyDeals = deals.filter(d => d.companyId === currentCompany?.id);
  const companyLeads = leads.filter(l => l.companyId === currentCompany?.id);
  const companyTasks = tasks.filter(t => t.companyId === currentCompany?.id);
  const wonDeals = companyDeals.filter(d => d.stage === 'Closed Won');
  const pipeValue = companyDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
  const wonValue = wonDeals.reduce((s, d) => s + (d.value || 0), 0);
  const overdueTask = companyTasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date()).length;

  const leaderboard = teamMembers.map(u => ({
    ...u,
    leadsCount: leads.filter(l => l.assignedTo === u.id).length,
    dealsWon: deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').length,
    revenue: deals.filter(d => d.assignedTo === u.id && d.stage === 'Closed Won').reduce((s, d) => s + (d.value || 0), 0),
    tasksDone: tasks.filter(t => t.assignedTo === u.id && t.status === 'completed').length,
  })).sort((a, b) => b.revenue - a.revenue);

  const PIPE_STAGES = ['Discovery', 'Qualified', 'Proposal', 'Negotiation'].map(stage => ({
    stage, count: companyDeals.filter(d => d.stage === stage).length,
    value: companyDeals.filter(d => d.stage === stage).reduce((s, d) => s + (d.value || 0), 0),
  }));
  const STAGECOLORS = ['#0EA5E9', '#6366F1', '#F59E0B', '#A855F7'];

  const WEEKLY_L = [{ week: 'W1', leads: 8 }, { week: 'W2', leads: 14 }, { week: 'W3', leads: 11 }, { week: 'W4', leads: 18 }, { week: 'W5', leads: companyLeads.length }];

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={16} style={{ color: '#0EA5E9' }} />
            <span className="text-xs font-700 uppercase tracking-widest" style={{ color: '#0EA5E9' }}>Human Resource Dashboard</span>
          </div>
          <h1 className="font-display font-700 text-3xl tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Team Overview, {currentUser?.name?.split(' ')[0]} 📊
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {teamMembers.length} sales reps · {companyLeads.length} leads · Pipeline health
          </p>
        </div>
        <button onClick={() => navigate('/user/profile')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600"
          style={{ background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', border: '1px solid rgba(14,165,233,0.2)' }}>
          <UserCheck size={15} /> My Profile
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard title="Team Size" value={teamMembers.length} subtitle="sales reps" icon={Users} accentColor="#0EA5E9" />
        <StatCard title="Pipeline" value={`₹${(pipeValue / 1000).toFixed(0)}K`} subtitle={`${companyDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length} deals`} icon={Layers} accentColor="#6366F1" trend={18} />
        <StatCard title="Revenue Won" value={`₹${(wonValue / 1000).toFixed(0)}K`} subtitle={`${wonDeals.length} closed`} icon={Award} accentColor="#10B981" trend={24} />
        <StatCard title="Overdue Tasks" value={overdueTask} subtitle="need attention" icon={AlertCircle} accentColor={overdueTask > 0 ? '#EF4444' : '#10B981'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="card p-5">
          <p className="text-sm font-700 mb-4" style={{ color: 'var(--text-primary)' }}>Pipeline by Stage</p>
          <div className="flex flex-col gap-3">
            {PIPE_STAGES.map((p, i) => {
              const max = Math.max(...PIPE_STAGES.map(x => x.value), 1);
              return (
                <div key={p.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-600" style={{ color: 'var(--text-secondary)' }}>{p.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-700" style={{ color: STAGECOLORS[i] }}>{p.count}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>₹{(p.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background: 'var(--border-primary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(p.value / max) * 100}%`, background: STAGECOLORS[i] }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-700 mb-1" style={{ color: 'var(--text-primary)' }}>Lead Inflow Trend</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Weekly new leads</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={WEEKLY_L}>
              <defs>
                <linearGradient id="mgrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="leads" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#mgrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card overflow-hidden mb-5">
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <Star size={15} style={{ color: '#F59E0B' }} />
          <p className="text-sm font-700" style={{ color: 'var(--text-primary)' }}>Team Leaderboard</p>
        </div>
        {leaderboard.length === 0 ? (
          <div className="py-8 text-center"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No sales reps yet. Add employees in the Company Admin panel.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Rep</th><th>Leads</th><th>Won</th><th>Revenue</th><th>Performance</th></tr></thead>
              <tbody>
                {leaderboard.map((rep, i) => {
                  const maxR = Math.max(...leaderboard.map(r => r.revenue), 1);
                  const pct = Math.round((rep.revenue / maxR) * 100);
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <tr key={rep.id}>
                      <td><span className="font-display font-700 text-lg" style={{ color: i < 3 ? '#F59E0B' : 'var(--text-muted)' }}>{medals[i] || `#${i + 1}`}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', color: 'white' }}>{rep.avatar}</div>
                          <div>
                            <p className="font-600 text-sm" style={{ color: 'var(--text-primary)' }}>{rep.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rep.department}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rep.leadsCount}</td>
                      <td style={{ fontWeight: 600, color: '#10B981' }}>{rep.dealsWon}</td>
                      <td><span className="font-mono text-xs font-700" style={{ color: '#10B981' }}>₹{rep.revenue.toLocaleString()}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full" style={{ background: 'var(--border-primary)', width: 80 }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#0EA5E9,#6366F1)' }}></div>
                          </div>
                          <span className="text-xs font-600" style={{ color: '#0EA5E9' }}>{pct}%</span>
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
    </div>
  );
}


/* ─────────────────── MAIN EXPORT ─────────────────── */
export default function UDashboard() {
  const ctx = useAuth();
  const { currentUser } = ctx;
  const props = { ...ctx };

  switch (currentUser?.role) {
    case 'sales': return <SalesDashboard   {...props} />;
    case 'manager': return <ManagerDashboard {...props} />;
    case 'support': return <SupportDashboard {...props} />;
    case 'finance': return <FinanceDashboard {...props} />;
    case 'human-resource': return <HumanResourceDashboard {...props} />;
    default: return <SalesDashboard   {...props} />;
  }
}
