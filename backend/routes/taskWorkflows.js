const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const UserNotification = require('../models/UserNotification');
const User = require('../models/User');
const { requireAuthentication } = require('./auth');
const logActivity = require('../utils/logActivity');

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Only a ${role} can access this resource.` });
  }
  return next();
};

router.get('/admin/tasks', requireAuthentication, requireRole('Admin'), async (req, res, next) => {
  try {
    const [tasks, projects, teamMembers] = await Promise.all([
      Task.find()
        .populate('project', 'title')
        .populate('assignedTo', 'fullName email role status')
        .populate('assignedBy', 'fullName')
        .sort({ assignedAt: -1 })
        .lean(),
      Project.find()
        .populate('assignedTo', 'fullName email role status')
        .select('title assignedTo')
        .sort({ title: 1 })
        .lean(),
      User.find({ role: 'Member', status: 'Active' })
        .select('fullName email')
        .sort({ fullName: 1 })
        .lean(),
    ]);

    return res.json({
      tasks,
      projects,
      teamMembers,
      summary: {
        total: tasks.length,
        assigned: tasks.filter((task) => task.status === 'Assigned').length,
        completed: tasks.filter((task) => task.status === 'Completed').length,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/admin/tasks', requireAuthentication, requireRole('Admin'), async (req, res, next) => {
  try {
    const { title, description = '', projectId, userId, dueDate, priority = 'Medium' } = req.body;
    if (
      typeof title !== 'string' || !title.trim() || title.trim().length > 120 ||
      typeof description !== 'string' || description.trim().length > 1000 ||
      typeof projectId !== 'string' || !mongoose.Types.ObjectId.isValid(projectId) ||
      typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId) ||
      (dueDate !== undefined && dueDate !== '' && !Number.isFinite(Date.parse(dueDate))) ||
      !['High', 'Medium', 'Low'].includes(priority)
    ) {
      return res.status(400).json({ message: 'Enter a task title, project, active user, valid due date, and priority.' });
    }

    const [project, assignee] = await Promise.all([
      Project.findById(projectId),
      User.findOne({ _id: userId, role: 'Member', status: 'Active' }),
    ]);
    if (!project || !assignee) {
      return res.status(404).json({ message: 'Project or active team member was not found.' });
    }
    if (!project.assignedTo || project.assignedTo.toString() !== assignee.id) {
      return res.status(400).json({ message: 'Assign this project to the selected user before assigning its tasks.' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project: project._id,
      assignedTo: assignee._id,
      assignedBy: req.user._id,
      assignedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
    });
    await UserNotification.create({
      recipient: assignee._id,
      type: 'TaskAssigned',
    });
    await logActivity({
      actor: req.user,
      action: 'Create',
      module: 'Task',
      details: `Assigned task "${task.title}" to ${assignee.fullName}`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title')
      .populate('assignedTo', 'fullName email role status')
      .populate('assignedBy', 'fullName')
      .lean();
    return res.status(201).json({ task: populatedTask });
  } catch (error) {
    return next(error);
  }
});

router.get('/user/tasks', requireAuthentication, requireRole('Member'), async (req, res, next) => {
  try {
    const assignedProjects = await Project.find({ assignedTo: req.user._id }).select('_id');
    const tasks = await Task.find({
      assignedTo: req.user._id,
      project: { $in: assignedProjects.map((project) => project._id) },
    })
      .populate('project', 'title')
      .sort({ assignedAt: -1 })
      .lean();
    return res.json({ tasks });
  } catch (error) {
    return next(error);
  }
});

router.patch(
  '/user/tasks/:id/complete',
  requireAuthentication,
  requireRole('Member'),
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Assigned task not found.' });
      }
      const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user._id });
      if (!task) {
        return res.status(404).json({ message: 'Assigned task not found.' });
      }
      const assignedProject = await Project.exists({
        _id: task.project,
        assignedTo: req.user._id,
      });
      if (!assignedProject) {
        return res.status(404).json({ message: 'Assigned task not found.' });
      }
      if (task.status !== 'Completed') {
        task.status = 'Completed';
        task.completedAt = new Date();
        await task.save();
        await logActivity({
          actor: req.user,
          action: 'Update',
          module: 'Task',
          details: `Completed task "${task.title}"`,
        });
      }

      const completedTask = await Task.findById(task._id)
        .populate('project', 'title')
        .lean();
      return res.json({ task: completedTask });
    } catch (error) {
      return next(error);
    }
  },
);

module.exports = router;
