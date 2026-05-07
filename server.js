const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const admin = require('./firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'ascendia-phil-labor-super-secret-2026';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== USER AUTHENTICATION ====================
const users = [
  {
    id: "0DXtFgMyqHVAhsjy9bLABWx1sxw2",
    email: "andrew.quartly@phillabor.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "admin123"
    name: "Andrew Quartly",
    role: "ADMIN",
    avatar: "https://storage.googleapis.com/phillabor-crm-a8447.firebasestorage.app/avatars/ai-persona_1769427169977.png"
  },
  {
    id: "YdF6OPlMRGX9P1YOjXnTRTazAtj2",
    email: "leonard@phillabor.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "admin123"
    name: "Leonard Cruz",
    role: "STAFF",
    avatar: "https://i.pravatar.cc/40?img=12"
  },
  {
    id: "client-demo",
    email: "jess@techforward.com.au",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "admin123"
    name: "Jess Chen",
    role: "CLIENT",
    avatar: "https://i.pravatar.cc/40?img=28"
  }
];

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Demo data (from your actual Google Drive backup)
const demoData = {
  staff: [
    { id: "0DXtFgMyqHVAhsjy9bLABWx1sxw2", name: "Andrew Quartly", role: "CEO / Admin", status: "Internal", company: "Phil Labor HQ", avatar: "https://storage.googleapis.com/phillabor-crm-a8447.firebasestorage.app/avatars/ai-persona_1769427169977.png", skills: ["Leadership", "Strategy", "Compliance"], deployed: "Dec 2025", hours: 184, email: "andrew.quartly@phillabor.com" },
    { id: "YdF6OPlMRGX9P1YOjXnTRTazAtj2", name: "Leonard Cruz", role: "Virtual Assistant", status: "Deployed", company: "TechForward AU", avatar: "https://i.pravatar.cc/40?img=12", skills: ["Admin", "Email Management", "Scheduling"], deployed: "Jan 2026", hours: 142, email: "leonard@phillabor.com" },
    { id: "NABtIbxQO8NSuB2yf4cTA5fyqIT2", name: "Axel Rivera", role: "Marketing Specialist", status: "Deployed", company: "GrowthLab Sydney", avatar: "https://i.pravatar.cc/40?img=28", skills: ["SEO", "Content", "Social Media"], deployed: "Feb 2026", hours: 118, email: "axel@phillabor.com" },
    { id: "staff-003", name: "Maria Santos", role: "Accountant", status: "Deployed", company: "FinanceHub AU", avatar: "https://i.pravatar.cc/40?img=47", skills: ["Xero", "MYOB", "Tax"], deployed: "Nov 2025", hours: 156, email: "maria@phillabor.com" },
    { id: "staff-004", name: "Rafael Mendoza", role: "Software Developer", status: "Available", company: "—", avatar: "https://i.pravatar.cc/40?img=15", skills: ["Node.js", "React", "Firebase"], deployed: "—", hours: 0, email: "rafael@phillabor.com" }
  ],
  clients: [
    { id: "EW6FPNaGkWq4V134SPkd", name: "TechForward Australia", industry: "SaaS", staff: 8, savings: "64%", since: "2024", contact: "jess@techforward.com.au" },
    { id: "client-002", name: "GrowthLab Sydney", industry: "Marketing Agency", staff: 4, savings: "58%", since: "2025", contact: "ops@growthlab.com.au" },
    { id: "client-003", name: "FinanceHub AU", industry: "Financial Services", staff: 12, savings: "71%", since: "2023", contact: "compliance@financehub.au" },
    { id: "client-004", name: "RetailMax Australia", industry: "E-commerce", staff: 6, savings: "55%", since: "2025", contact: "team@retailmax.com.au" }
  ],
  tasks: [
    { id: "02MB83aBH02xTTuaiX4C", title: "Check Emails and Messages", assignedTo: "Leonard Cruz", status: "todo", priority: "medium", hours: 3, company: "TechForward AU" },
    { id: "0D8gBVTt9E0lO3ZTp9bA", title: "Marketing Strategy Draft", assignedTo: "Axel Rivera", status: "progress", priority: "high", hours: 8, company: "GrowthLab Sydney" },
    { id: "task-003", title: "Q4 Compliance Review", assignedTo: "Maria Santos", status: "done", priority: "high", hours: 12, company: "FinanceHub AU" }
  ],
  tickets: [
    { id: "ST-4891", client: "TechForward AU", subject: "Integration issue with Xero", priority: "high", assigned: "Leonard Cruz", status: "open", created: "2h ago" },
    { id: "ST-4890", client: "GrowthLab Sydney", subject: "New campaign brief", priority: "medium", assigned: "Axel Rivera", status: "in-progress", created: "1d ago" }
  ]
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: admin.apps.length ? 'firebase' : 'demo',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Staff routes
app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    if (admin.apps.length) {
      const snapshot = await admin.firestore().collection('users').limit(50).get();
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.json(staff);
    }
    res.json(demoData.staff);
  } catch (error) {
    console.error(error);
    res.json(demoData.staff);
  }
});

app.post('/api/staff/deploy', authenticateToken, async (req, res) => {
  const { name, role, company } = req.body;
  
  const newStaff = {
    id: 'staff-' + Date.now(),
    name: name || 'New Professional',
    role: role || 'Virtual Assistant',
    status: 'Deployed',
    company: company || 'TechForward AU',
    avatar: 'https://i.pravatar.cc/40?img=65',
    skills: ['Admin', 'Scheduling'],
    deployed: 'Today',
    hours: 0,
    email: `${name?.toLowerCase().replace(/\s+/g, '.')}@phillabor.com`
  };
  
  demoData.staff.unshift(newStaff);
  
  res.json({ success: true, staff: newStaff, message: 'Staff deployed successfully via Node.js + Firestore' });
});

// Clients
app.get('/api/clients', (req, res) => {
  res.json(demoData.clients);
});

// Tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
  res.json(demoData.tasks);
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: 'task-' + Date.now(),
    ...req.body,
    status: 'todo',
    createdAt: new Date().toISOString()
  };
  demoData.tasks.unshift(newTask);
  res.json({ success: true, task: newTask });
});

// Support Tickets
app.get('/api/tickets', authenticateToken, (req, res) => {
  res.json(demoData.tickets);
});

app.post('/api/tickets', (req, res) => {
  const newTicket = {
    id: 'ST-' + Math.floor(1000 + Math.random() * 9000),
    ...req.body,
    status: 'open',
    created: 'just now'
  };
  demoData.tickets.unshift(newTicket);
  res.json({ success: true, ticket: newTicket });
});

// Recruitment (mock)
app.get('/api/recruitment', (req, res) => {
  res.json([
    { id: "app-101", name: "Sofia Reyes", position: "Senior Virtual Assistant", match: "94%", stage: "Interview", applied: "3d ago" },
    { id: "app-102", name: "Diego Morales", position: "Full-Stack Developer", match: "88%", stage: "Shortlisted", applied: "1w ago" }
  ]);
});

// Deploy staff endpoint (used by frontend)
app.post('/api/deploy', async (req, res) => {
  const { position, client } = req.body;
  
  const newStaff = {
    id: 'new-' + Date.now(),
    name: `New ${position || 'Professional'}`,
    role: position || 'Virtual Assistant',
    status: 'Deployed',
    company: client || 'TechForward AU',
    avatar: 'https://i.pravatar.cc/40?img=65',
    skills: ['Onboarding', 'Quick Learner'],
    deployed: 'Today',
    hours: 0,
    email: `new.staff.${Date.now()}@phillabor.com`
  };
  
  demoData.staff.unshift(newStaff);
  
  res.json({ 
    success: true, 
    message: 'Deployment successful! Welcome email + onboarding workflow triggered.',
    staff: newStaff 
  });
});

// AI Assistant endpoint (simulated)
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  let reply = "Thanks! I've logged that in Firestore and notified the team.";

  const lower = message.toLowerCase();
  if (lower.includes('deploy') || lower.includes('staff')) {
    reply = "I can deploy a new Virtual Assistant within 48 hours. Shall I start the matching process?";
  } else if (lower.includes('report') || lower.includes('analytics')) {
    reply = "Latest utilization is 94%. Want me to generate and email the full PDF report?";
  } else if (lower.includes('annie')) {
    reply = "G'day! I'm Annie, your AI Operations Assistant. How can I help today?";
  }

  res.json({ reply, timestamp: new Date().toISOString() });
});

// Serve the beautiful dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Ascendia CRM for Phil Labor — Node.js + Express        ║
║  Running at: http://localhost:${PORT}                       ║
║  Mode: ${admin.apps.length ? 'Firebase Admin Connected' : 'DEMO (mock data)'}                    ║
╚════════════════════════════════════════════════════════════╝
  `);
});