// ─── TRACKFIELD CRM — MOCK DATA ──────────────────────────────────────────────

export const PLANS = {
  free: { name: 'Free', color: '#64748B', users: 5, leads: 100, storage: '1GB', price: 0 },
  pro: { name: 'Pro', color: '#0EA5E9', users: 25, leads: 5000, storage: '20GB', price: 49 },
  enterprise: { name: 'Enterprise', color: '#A855F7', users: 999, leads: 99999, storage: '500GB', price: 199 },
};

export const ALL_MODULES = [
  { id: 'leads',       name: 'Leads',       icon: 'Users',       description: 'Manage inbound & outbound leads' },
  { id: 'deals',       name: 'Deals',       icon: 'TrendingUp',  description: 'Track deal pipeline & stages' },
  { id: 'contacts',    name: 'Contacts',    icon: 'Contact',     description: 'Central contact database' },
  { id: 'tasks',       name: 'Tasks',       icon: 'CheckSquare', description: 'Task & follow-up management' },
  { id: 'payments',    name: 'Payments',    icon: 'CreditCard',  description: 'Invoices & payment tracking' },
  { id: 'reports',     name: 'Reports',     icon: 'BarChart2',   description: 'Analytics & reporting' },
  { id: 'automation',  name: 'Automation',  icon: 'Zap',         description: 'Workflow automation engine' },
  { id: 'tickets',     name: 'Tickets',     icon: 'Ticket',      description: 'Support ticket management' },
  { id: 'emails',      name: 'Emails',      icon: 'Mail',        description: 'Email campaigns & tracking' },
  { id: 'ai',          name: 'AI Features', icon: 'Brain',       description: 'AI scoring & suggestions' },
  { id: 'integrations',name: 'Integrations',icon: 'Plug',        description: 'Third-party integrations' },
  { id: 'custom',      name: 'Custom Fields',icon: 'Sliders',    description: 'Custom fields & modules' },
];

export const initialCompanies = [
  {
    id: 'c1',
    name: 'Nexora Solutions',
    domain: 'nexora.io',
    plan: 'enterprise',
    status: 'active',
    users: 18,
    leads: 2340,
    revenue: 2388,
    joinedDate: '2024-01-15',
    adminName: 'Arjun Mehta',
    adminEmail: 'admin@nexora.io',
    adminPassword: 'admin123',
    industry: 'Technology',
    enabledModules: ['leads','deals','contacts','tasks','payments','reports','automation','emails','ai','integrations','custom'],
  },
  {
    id: 'c2',
    name: 'BlueWave Retail',
    domain: 'bluewave.com',
    plan: 'pro',
    status: 'active',
    users: 9,
    leads: 890,
    revenue: 588,
    joinedDate: '2024-03-10',
    adminName: 'Priya Sharma',
    adminEmail: 'admin@bluewave.com',
    adminPassword: 'admin123',
    industry: 'Retail',
    enabledModules: ['leads','deals','contacts','tasks','reports','emails'],
  },
  {
    id: 'c3',
    name: 'EduPath Academy',
    domain: 'edupathacademy.in',
    plan: 'pro',
    status: 'active',
    users: 14,
    leads: 1200,
    revenue: 588,
    joinedDate: '2024-02-28',
    adminName: 'Rahul Verma',
    adminEmail: 'admin@edupathacademy.in',
    adminPassword: 'admin123',
    industry: 'Education',
    enabledModules: ['leads','deals','contacts','tasks','reports','automation','emails'],
  },
  {
    id: 'c4',
    name: 'FinVault Capital',
    domain: 'finvault.co',
    plan: 'enterprise',
    status: 'active',
    users: 31,
    leads: 3120,
    revenue: 2388,
    joinedDate: '2023-11-05',
    adminName: 'Sneha Iyer',
    adminEmail: 'admin@finvault.co',
    adminPassword: 'admin123',
    industry: 'Finance',
    enabledModules: ['leads','deals','contacts','tasks','payments','reports','automation','tickets','emails','ai','integrations','custom'],
  },
  {
    id: 'c5',
    name: 'Sparkify Media',
    domain: 'sparkify.media',
    plan: 'free',
    status: 'inactive',
    users: 3,
    leads: 45,
    revenue: 0,
    joinedDate: '2024-05-01',
    adminName: 'Dev Kapoor',
    adminEmail: 'admin@sparkify.media',
    adminPassword: 'admin123',
    industry: 'Media',
    enabledModules: ['leads','contacts','tasks'],
  },
];

export const initialUsers = [
  // Nexora Solutions (c1)
  { id: 'u1',  companyId: 'c1', name: 'Arjun Mehta',   email: 'admin@nexora.io',      password: 'admin123', role: 'company_admin', department: 'Management', status: 'active', lastLogin: '2 hours ago',   avatar: 'AM' },
  { id: 'u2',  companyId: 'c1', name: 'Rohan Das',     email: 'rohan@nexora.io',      password: 'user123',  role: 'sales',         department: 'Sales',      status: 'active', lastLogin: '1 hour ago',    avatar: 'RD' },
  { id: 'u3',  companyId: 'c1', name: 'Kavya Nair',    email: 'kavya@nexora.io',      password: 'user123',  role: 'manager',       department: 'Sales',      status: 'active', lastLogin: '30 mins ago',   avatar: 'KN' },
  { id: 'u4',  companyId: 'c1', name: 'Aditya Singh',  email: 'aditya@nexora.io',     password: 'user123',  role: 'support',       department: 'Support',    status: 'active', lastLogin: '3 hours ago',   avatar: 'AS' },
  { id: 'u5',  companyId: 'c1', name: 'Meera Patel',   email: 'meera@nexora.io',      password: 'user123',  role: 'finance',       department: 'Finance',    status: 'active', lastLogin: 'Yesterday',     avatar: 'MP' },
  // BlueWave (c2)
  { id: 'u6',  companyId: 'c2', name: 'Priya Sharma',  email: 'admin@bluewave.com',   password: 'admin123', role: 'company_admin', department: 'Management', status: 'active', lastLogin: '5 hours ago',   avatar: 'PS' },
  { id: 'u7',  companyId: 'c2', name: 'Vikram Joshi',  email: 'vikram@bluewave.com',  password: 'user123',  role: 'sales',         department: 'Sales',      status: 'active', lastLogin: '2 days ago',    avatar: 'VJ' },
  { id: 'u8',  companyId: 'c2', name: 'Ananya Roy',    email: 'ananya@bluewave.com',  password: 'user123',  role: 'manager',       department: 'Sales',      status: 'active', lastLogin: 'Yesterday',     avatar: 'AR' },
  // EduPath (c3)
  { id: 'u9',  companyId: 'c3', name: 'Rahul Verma',   email: 'admin@edupathacademy.in', password: 'admin123', role: 'company_admin', department: 'Management', status: 'active', lastLogin: '1 day ago',  avatar: 'RV' },
  { id: 'u10', companyId: 'c3', name: 'Sana Khan',     email: 'sana@edupathacademy.in',  password: 'user123',  role: 'sales',         department: 'Admissions', status: 'active', lastLogin: '4 hours ago', avatar: 'SK' },
  // FinVault (c4)
  { id: 'u11', companyId: 'c4', name: 'Sneha Iyer',    email: 'admin@finvault.co',    password: 'admin123', role: 'company_admin', department: 'Management', status: 'active', lastLogin: '1 hour ago',   avatar: 'SI' },
  { id: 'u12', companyId: 'c4', name: 'Nikhil Gupta',  email: 'nikhil@finvault.co',   password: 'user123',  role: 'manager',       department: 'Sales',      status: 'active', lastLogin: '2 hours ago',  avatar: 'NG' },
];

export const initialLeads = [
  { id: 'l1',  companyId: 'c1', name: 'TechCorp Pvt Ltd',    contact: 'Sanjay Kumar',  email: 'sanjay@techcorp.in',  phone: '+91 9812345678', status: 'new',        source: 'Website',   value: 85000,  assignedTo: 'u2', priority: 'high',   createdAt: '2025-01-10', lastContact: '2 days ago', tags: ['B2B','Tech'] },
  { id: 'l2',  companyId: 'c1', name: 'Global Traders',      contact: 'Anjali Bose',   email: 'anjali@globaltr.com', phone: '+91 9876543210', status: 'contacted',  source: 'LinkedIn',  value: 42000,  assignedTo: 'u2', priority: 'medium', createdAt: '2025-01-08', lastContact: '1 day ago',  tags: ['Import'] },
  { id: 'l3',  companyId: 'c1', name: 'StartupNest',         contact: 'Kiran Mishra',  email: 'kiran@startupnest.io',phone: '+91 7894561230', status: 'qualified',  source: 'Referral',  value: 120000, assignedTo: 'u3', priority: 'high',   createdAt: '2025-01-05', lastContact: '3 hours ago',tags: ['SaaS'] },
  { id: 'l4',  companyId: 'c1', name: 'MedPlus Healthcare',  contact: 'Dr. Prashant',  email: 'prashant@medplus.in', phone: '+91 8765432109', status: 'proposal',   source: 'Event',     value: 200000, assignedTo: 'u3', priority: 'high',   createdAt: '2025-01-03', lastContact: 'Today',      tags: ['Healthcare'] },
  { id: 'l5',  companyId: 'c1', name: 'Zenith Logistics',    contact: 'Ritesh Tiwari', email: 'ritesh@zenith.com',   phone: '+91 9123456789', status: 'lost',        source: 'Cold Call', value: 35000,  assignedTo: 'u2', priority: 'low',    createdAt: '2024-12-20', lastContact: '1 week ago', tags: [] },
  { id: 'l6',  companyId: 'c1', name: 'CloudBase Systems',   contact: 'Divya Rao',     email: 'divya@cloudbase.io',  phone: '+91 9654321870', status: 'new',        source: 'Ad',        value: 68000,  assignedTo: 'u2', priority: 'medium', createdAt: '2025-01-12', lastContact: 'Today',      tags: ['Cloud'] },
  { id: 'l7',  companyId: 'c2', name: 'Fashion Hub Delhi',   contact: 'Riya Malhotra', email: 'riya@fashionhub.in',  phone: '+91 9988776655', status: 'new',        source: 'Instagram', value: 25000,  assignedTo: 'u7', priority: 'medium', createdAt: '2025-01-11', lastContact: 'Today',      tags: ['Retail'] },
  { id: 'l8',  companyId: 'c2', name: 'Urban Style Co',      contact: 'Mohit Khanna',  email: 'mohit@urbanstyle.in', phone: '+91 9871234560', status: 'contacted',  source: 'Website',   value: 18000,  assignedTo: 'u7', priority: 'low',    createdAt: '2025-01-09', lastContact: '2 days ago', tags: [] },
  { id: 'l9',  companyId: 'c3', name: 'DPS School Group',    contact: 'Anupam Yadav',  email: 'anupam@dps.edu',      phone: '+91 9001122334', status: 'qualified',  source: 'Referral',  value: 150000, assignedTo: 'u10',priority: 'high',   createdAt: '2025-01-07', lastContact: 'Yesterday',  tags: ['Education'] },
  { id: 'l10', companyId: 'c3', name: 'Sunrise Institute',   contact: 'Geeta Arora',   email: 'geeta@sunrise.edu',   phone: '+91 9887766554', status: 'new',        source: 'Website',   value: 80000,  assignedTo: 'u10',priority: 'medium', createdAt: '2025-01-12', lastContact: 'Today',      tags: [] },
];

export const initialDeals = [
  { id: 'd1', companyId: 'c1', name: 'TechCorp Enterprise License',   contact: 'Sanjay Kumar',  value: 250000, stage: 'Proposal',       probability: 60, assignedTo: 'u3', expectedClose: '2025-02-15', createdAt: '2025-01-05' },
  { id: 'd2', companyId: 'c1', name: 'StartupNest Platform Deal',     contact: 'Kiran Mishra',  value: 120000, stage: 'Negotiation',     probability: 75, assignedTo: 'u3', expectedClose: '2025-01-30', createdAt: '2025-01-03' },
  { id: 'd3', companyId: 'c1', name: 'MedPlus Annual Contract',       contact: 'Dr. Prashant',  value: 480000, stage: 'Closed Won',      probability: 100,assignedTo: 'u2', expectedClose: '2025-01-20', createdAt: '2024-12-10' },
  { id: 'd4', companyId: 'c1', name: 'CloudBase Integration',         contact: 'Divya Rao',     value: 95000,  stage: 'Discovery',       probability: 25, assignedTo: 'u2', expectedClose: '2025-03-01', createdAt: '2025-01-12' },
  { id: 'd5', companyId: 'c1', name: 'Global Traders Subscription',   contact: 'Anjali Bose',   value: 60000,  stage: 'Closed Lost',     probability: 0,  assignedTo: 'u2', expectedClose: '2025-01-15', createdAt: '2024-12-20' },
  { id: 'd6', companyId: 'c2', name: 'Fashion Hub Wholesale Deal',    contact: 'Riya Malhotra', value: 125000, stage: 'Proposal',        probability: 50, assignedTo: 'u7', expectedClose: '2025-02-10', createdAt: '2025-01-08' },
  { id: 'd7', companyId: 'c3', name: 'DPS Group Education Suite',     contact: 'Anupam Yadav',  value: 320000, stage: 'Negotiation',     probability: 80, assignedTo: 'u10',expectedClose: '2025-01-28', createdAt: '2025-01-05' },
  { id: 'd8', companyId: 'c4', name: 'FinVault Premium Licence',      contact: 'Nikhil Gupta',  value: 750000, stage: 'Closed Won',      probability: 100,assignedTo: 'u12',expectedClose: '2025-01-10', createdAt: '2024-12-01' },
];

export const PIPELINE_STAGES = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export const initialTasks = [
  { id: 't1', companyId: 'c1', title: 'Follow up with TechCorp',       assignedTo: 'u2', dueDate: '2025-01-15', priority: 'high',   status: 'pending',   type: 'Call',  relatedTo: 'l1' },
  { id: 't2', companyId: 'c1', title: 'Send proposal to StartupNest',  assignedTo: 'u3', dueDate: '2025-01-14', priority: 'high',   status: 'pending',   type: 'Email', relatedTo: 'l3' },
  { id: 't3', companyId: 'c1', title: 'Demo call with MedPlus team',   assignedTo: 'u3', dueDate: '2025-01-13', priority: 'medium', status: 'completed', type: 'Meeting',relatedTo: 'l4' },
  { id: 't4', companyId: 'c1', title: 'Prepare Q1 sales report',       assignedTo: 'u3', dueDate: '2025-01-20', priority: 'medium', status: 'pending',   type: 'Task',  relatedTo: null },
  { id: 't5', companyId: 'c1', title: 'Onboard CloudBase contact',     assignedTo: 'u2', dueDate: '2025-01-16', priority: 'low',    status: 'pending',   type: 'Email', relatedTo: 'l6' },
  { id: 't6', companyId: 'c2', title: 'Send Fashion Hub catalog',      assignedTo: 'u7', dueDate: '2025-01-14', priority: 'high',   status: 'pending',   type: 'Email', relatedTo: 'l7' },
  { id: 't7', companyId: 'c3', title: 'Call DPS procurement team',     assignedTo: 'u10',dueDate: '2025-01-15', priority: 'high',   status: 'pending',   type: 'Call',  relatedTo: 'l9' },
];

export const initialPayments = [
  { id: 'p1', companyId: 'c1', dealName: 'MedPlus Annual Contract',    amount: 480000, status: 'paid',    date: '2025-01-10', invoiceNo: 'INV-001' },
  { id: 'p2', companyId: 'c1', dealName: 'TechCorp Milestone 1',       amount: 80000,  status: 'pending', date: '2025-01-20', invoiceNo: 'INV-002' },
  { id: 'p3', companyId: 'c4', dealName: 'FinVault Premium Licence',   amount: 750000, status: 'paid',    date: '2025-01-10', invoiceNo: 'INV-003' },
];

export const initialAutomations = [
  { id: 'a1', companyId: 'c1', name: 'Auto-assign new leads to sales', trigger: 'Lead Created', action: 'Assign to Sales Round Robin', status: true,  runs: 142 },
  { id: 'a2', companyId: 'c1', name: 'Follow-up reminder after 3 days',trigger: 'No Contact 3 Days', action: 'Create Task: Follow Up',    status: true,  runs: 87  },
  { id: 'a3', companyId: 'c1', name: 'Welcome email on lead capture',  trigger: 'Lead Created',    action: 'Send Welcome Email',         status: false, runs: 234 },
  { id: 'a4', companyId: 'c1', name: 'Notify manager on deal won',     trigger: 'Deal Closed Won', action: 'Send Slack Notification',    status: true,  runs: 23  },
  { id: 'a5', companyId: 'c3', name: 'Send brochure to new students',  trigger: 'Lead Created',    action: 'Send Email + Brochure',      status: true,  runs: 310 },
];

// Role permissions matrix per company
export const DEFAULT_ROLE_PERMISSIONS = {
  sales: {
    leads: { view: true, create: true, edit: true, delete: false },
    deals: { view: true, create: true, edit: true, delete: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    tasks: { view: true, create: true, edit: true, delete: true },
    reports: { view: false, create: false, edit: false, delete: false },
    payments: { view: false, create: false, edit: false, delete: false },
    automation: { view: false, create: false, edit: false, delete: false },
    tickets: { view: false, create: true, edit: true, delete: false },
  },
  manager: {
    leads: { view: true, create: true, edit: true, delete: true },
    deals: { view: true, create: true, edit: true, delete: true },
    contacts: { view: true, create: true, edit: true, delete: true },
    tasks: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: false, delete: false },
    payments: { view: true, create: false, edit: false, delete: false },
    automation: { view: true, create: false, edit: false, delete: false },
    tickets: { view: true, create: true, edit: true, delete: false },
  },
  support: {
    leads: { view: false, create: false, edit: false, delete: false },
    deals: { view: false, create: false, edit: false, delete: false },
    contacts: { view: true, create: true, edit: true, delete: false },
    tasks: { view: true, create: true, edit: true, delete: true },
    reports: { view: false, create: false, edit: false, delete: false },
    payments: { view: false, create: false, edit: false, delete: false },
    automation: { view: false, create: false, edit: false, delete: false },
    tickets: { view: true, create: true, edit: true, delete: false },
  },
  finance: {
    leads: { view: false, create: false, edit: false, delete: false },
    deals: { view: true, create: false, edit: false, delete: false },
    contacts: { view: true, create: false, edit: false, delete: false },
    tasks: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    payments: { view: true, create: true, edit: true, delete: false },
    automation: { view: false, create: false, edit: false, delete: false },
    tickets: { view: false, create: false, edit: false, delete: false },
  },
};

export const REVENUE_DATA = [
  { month: 'Aug', revenue: 8200 },
  { month: 'Sep', revenue: 11400 },
  { month: 'Oct', revenue: 13800 },
  { month: 'Nov', revenue: 10200 },
  { month: 'Dec', revenue: 15600 },
  { month: 'Jan', revenue: 19800 },
];

export const LEAD_SOURCE_DATA = [
  { name: 'Website',  value: 38, color: '#0EA5E9' },
  { name: 'LinkedIn', value: 24, color: '#6366F1' },
  { name: 'Referral', value: 20, color: '#10B981' },
  { name: 'Events',   value: 12, color: '#F59E0B' },
  { name: 'Others',   value: 6,  color: '#64748B' },
];

export const CONVERSION_DATA = [
  { month: 'Aug', rate: 12 },
  { month: 'Sep', rate: 15 },
  { month: 'Oct', rate: 18 },
  { month: 'Nov', rate: 14 },
  { month: 'Dec', rate: 22 },
  { month: 'Jan', rate: 27 },
];
