const express = require('express');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { requireAuthentication } = require('./auth');

const router = express.Router();

router.get('/admin/reports', requireAuthentication, async (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only an Admin can access these reports.' });
  }

  try {
    const [projects, taskStatuses, memberCount, activeMemberCount, inactiveMemberCount, performance, recentActivity] = await Promise.all([
      Project.find()
        .select('title category status progress createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'Member' }),
      User.countDocuments({ role: 'Member', status: 'Active' }),
      User.countDocuments({ role: 'Member', status: 'Inactive' }),
      Task.aggregate([
        {
          $group: {
            _id: '$assignedTo',
            assigned: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          },
        },
        { $sort: { completed: -1, assigned: -1 } },
        { $limit: 4 },
      ]),
      Activity.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const projectStatuses = ['Active', 'Completed', 'On Hold'].map((status) => ({
      status,
      count: projects.filter((project) => project.status === status).length,
    }));
    const taskStatusCounts = ['Assigned', 'Completed'].map((status) => ({
      status,
      count: taskStatuses.find((item) => item._id === status)?.count || 0,
    }));
    const performanceMembers = await User.find({
      _id: { $in: performance.map((item) => item._id) },
    })
      .select('fullName')
      .lean();
    const memberNames = new Map(performanceMembers.map((member) => [member._id.toString(), member.fullName]));

    const today = new Date();
    const startDate = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - 6,
    ));
    const [projectActivity, taskActivity] = await Promise.all([
      Project.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Task.aggregate([
        { $match: { assignedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$assignedAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);
    const projectsByDate = new Map(projectActivity.map((item) => [item._id, item.count]));
    const tasksByDate = new Map(taskActivity.map((item) => [item._id, item.count]));
    const timeline = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - (6 - index),
      ));
      const dateKey = date.toISOString().slice(0, 10);
      return {
        date: dateKey,
        projects: projectsByDate.get(dateKey) || 0,
        tasks: tasksByDate.get(dateKey) || 0,
      };
    });

    const totalTasks = taskStatusCounts.reduce((total, item) => total + item.count, 0);
    return res.json({
      summary: {
        totalProjects: projects.length,
        activeProjects: projectStatuses.find((item) => item.status === 'Active').count,
        completedProjects: projectStatuses.find((item) => item.status === 'Completed').count,
        totalTasks,
        assignedTasks: taskStatusCounts.find((item) => item.status === 'Assigned').count,
        completedTasks: taskStatusCounts.find((item) => item.status === 'Completed').count,
        totalMembers: memberCount,
        activeMembers: activeMemberCount,
        inactiveMembers: inactiveMemberCount,
      },
      projectStatuses,
      taskStatuses: taskStatusCounts,
      timeline,
      teamPerformance: performance.map((item) => ({
        name: memberNames.get(item._id.toString()) || 'Former member',
        assigned: item.assigned,
        completed: item.completed,
        percentage: item.assigned ? Math.round((item.completed / item.assigned) * 100) : 0,
      })),
      topProjects: [...projects]
        .sort((left, right) => right.progress - left.progress)
        .slice(0, 3),
      recentActivity,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
