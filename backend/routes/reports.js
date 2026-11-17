const express = require('express');
const Activity = require('../models/Activity');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { requireAuthentication, requireSuperAdmin } = require('./auth');

const router = express.Router();

router.get('/', requireAuthentication, requireSuperAdmin, async (req, res, next) => {
  try {
    const today = new Date();
    const timelineStart = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - 6,
    ));
    const [projects, users, recentActivity, taskStatuses, taskTimeline] = await Promise.all([
      Project.find()
        .select('title category status progress createdAt updatedAt')
        .sort({ createdAt: -1 }),
      User.find()
        .select('fullName email role status createdAt')
        .sort({ createdAt: -1 }),
      Activity.find().sort({ createdAt: -1 }).limit(5).lean(),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        {
          $match: {
            assignedAt: { $gte: timelineStart },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$assignedAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const projectStatuses = ['Active', 'Completed', 'On Hold'].map((status) => ({
      status,
      count: projects.filter((project) => project.status === status).length,
    }));
    const roleCounts = ['Member', 'Admin', 'Super Admin'].map((role) => ({
      role,
      count: users.filter((user) => user.role === role).length,
    }));
    const taskCounts = ['Assigned', 'Completed'].map((status) => ({
      status,
      count: taskStatuses.find((item) => item._id === status)?.count || 0,
    }));
    const tasksByDate = new Map(taskTimeline.map((item) => [item._id, item.count]));
    const totalTasks = taskCounts.reduce((total, item) => total + item.count, 0);
    const completedTasks = taskCounts.find((item) => item.status === 'Completed').count;
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
        users: users.filter((user) => user.createdAt.toISOString().slice(0, 10) === dateKey).length,
        tasks: tasksByDate.get(dateKey) || 0,
      };
    });

    const categoryCounts = projects.reduce((counts, project) => {
      const category = project.category || 'Uncategorized';
      counts.set(category, (counts.get(category) || 0) + 1);
      return counts;
    }, new Map());
    const projectCategories = [...categoryCounts]
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => right.count - left.count);

    return res.json({
      summary: {
        totalProjects: projects.length,
        activeProjects: projectStatuses.find((item) => item.status === 'Active').count,
        completedProjects: projectStatuses.find((item) => item.status === 'Completed').count,
        onHoldProjects: projectStatuses.find((item) => item.status === 'On Hold').count,
        totalUsers: users.length,
        activeUsers: users.filter((user) => (user.status || 'Active') === 'Active').length,
        inactiveUsers: users.filter((user) => user.status === 'Inactive').length,
        totalTasks,
        completedTasks,
        taskCompletionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      projectStatuses,
      taskStatuses: taskCounts,
      projectCategories,
      roleCounts,
      timeline,
      recentUsers: users.slice(0, 4),
      recentActivity,
      topProjects: [...projects]
        .sort((left, right) => right.progress - left.progress)
        .slice(0, 3),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
