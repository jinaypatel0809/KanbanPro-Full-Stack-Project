const express = require('express');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const User = require('../models/User');
const { requireAuthentication } = require('./auth');

const router = express.Router();

router.get('/', requireAuthentication, async (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only an Admin can access this dashboard.' });
  }

  try {
    const teamFilter = { role: { $in: ['Member', 'Admin'] } };
    const [projects, teamMembers, teamMemberCount, recentActivity] = await Promise.all([
      Project.find().select('title category status progress createdAt').sort({ createdAt: -1 }),
      User.find(teamFilter)
        .select('fullName role status createdAt')
        .sort({ createdAt: -1 })
        .limit(4),
      User.countDocuments(teamFilter),
      Activity.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const projectStatuses = ['Active', 'Completed', 'On Hold'].map((status) => ({
      status,
      count: projects.filter((project) => project.status === status).length,
    }));
    const today = new Date();
    const timeline = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - (6 - index),
      ));
      const dateKey = date.toISOString().slice(0, 10);
      return {
        date: dateKey,
        projects: projects.filter((project) => project.createdAt.toISOString().slice(0, 10) === dateKey).length,
      };
    });

    return res.json({
      summary: {
        totalProjects: projects.length,
        activeProjects: projectStatuses.find((item) => item.status === 'Active').count,
        completedProjects: projectStatuses.find((item) => item.status === 'Completed').count,
        onHoldProjects: projectStatuses.find((item) => item.status === 'On Hold').count,
        teamMembers: teamMemberCount,
      },
      projectStatuses,
      timeline,
      projects: projects.slice(0, 4),
      teamMembers,
      recentActivity,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
