require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { router: authRoutes } = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const reportsRoutes = require('./routes/reports');
const activitiesRoutes = require('./routes/activities');
const adminDashboardRoutes = require('./routes/adminDashboard');
const projectWorkflowsRoutes = require('./routes/projectWorkflows');
const taskWorkflowsRoutes = require('./routes/taskWorkflows');
const adminTeamRoutes = require('./routes/adminTeam');
const adminReportsRoutes = require('./routes/adminReports');
const userNotificationsRoutes = require('./routes/userNotifications');

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:5173',
  'https://kanban-pro-full-stack-project.vercel.app',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(cors({
  origin: [...new Set(allowedOrigins)],
}));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/admin-dashboard', adminDashboardRoutes);
app.use('/api', projectWorkflowsRoutes);
app.use('/api', taskWorkflowsRoutes);
app.use('/api', adminTeamRoutes);
app.use('/api', adminReportsRoutes);
app.use('/api', userNotificationsRoutes);

app.use((error, req, res, next) => {
  console.error(`API error: ${error.message}`);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  process.exit(1);
});
