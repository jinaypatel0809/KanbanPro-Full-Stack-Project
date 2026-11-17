const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const ProjectProgressReport = require('../models/ProjectProgressReport');
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

router.get('/admin/projects', requireAuthentication, requireRole('Admin'), async (req, res, next) => {
  try {
    const [projects, teamMembers] = await Promise.all([
      Project.find()
        .populate('assignedTo', 'fullName email role status')
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ role: 'Member', status: 'Active' })
        .select('fullName email role')
        .sort({ fullName: 1 })
        .lean(),
    ]);
    return res.json({ projects, teamMembers });
  } catch (error) {
    return next(error);
  }
});

router.patch(
  '/admin/projects/:id/assignment',
  requireAuthentication,
  requireRole('Admin'),
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      const { userId } = req.body;
      if (userId !== null && (typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId))) {
        return res.status(400).json({ message: 'Choose a valid team member or leave the project unassigned.' });
      }

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }

      let assignee = null;
      if (userId) {
        assignee = await User.findOne({ _id: userId, role: 'Member', status: 'Active' });
        if (!assignee) {
          return res.status(400).json({ message: 'The selected team member is not active or does not exist.' });
        }
      }

      const previousAssigneeId = project.assignedTo?.toString();
      project.assignedTo = assignee?._id || null;
      await project.save();
      if (assignee && previousAssigneeId !== assignee.id) {
        await UserNotification.create({
          recipient: assignee._id,
          type: 'ProjectAssigned',
        });
      }
      await logActivity({
        actor: req.user,
        action: 'Update',
        module: 'Project',
        details: assignee
          ? `Assigned project "${project.title}" to ${assignee.fullName}`
          : `Removed the assignee from project "${project.title}"`,
      });

      return res.json({
        project: {
          ...project.toObject(),
          assignedTo: assignee
            ? { id: assignee.id, fullName: assignee.fullName, email: assignee.email, role: assignee.role }
            : null,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  '/admin/projects/:id/daily-reports',
  requireAuthentication,
  requireRole('Admin'),
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Project not found.' });
      }
      const project = await Project.findById(req.params.id).select('title');
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
      const reports = await ProjectProgressReport.find({ project: project._id })
        .populate('user', 'fullName email')
        .sort({ reportDate: -1, submittedAt: -1 })
        .lean();
      return res.json({ reports });
    } catch (error) {
      return next(error);
    }
  },
);

router.get('/user/projects', requireAuthentication, requireRole('Member'), async (req, res, next) => {
  try {
    const projects = await Project.find({ assignedTo: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const projectIds = projects.map((project) => project._id);
    const reports = await ProjectProgressReport.find({
      user: req.user._id,
      project: { $in: projectIds },
    })
      .sort({ reportDate: -1, submittedAt: -1 })
      .lean();
    const latestReportByProject = new Map();
    reports.forEach((report) => {
      const projectId = report.project.toString();
      if (!latestReportByProject.has(projectId)) {
        latestReportByProject.set(projectId, report);
      }
    });

    return res.json({
      projects: projects.map((project) => ({
        ...project,
        latestReport: latestReportByProject.get(project._id.toString()) || null,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/user/projects/:id/daily-reports',
  requireAuthentication,
  requireRole('Member'),
  async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).json({ message: 'Project not found.' });
      }
      const progress = Number(req.body.progress);
      const note = req.body.note === undefined ? '' : req.body.note;
      if (
        !Number.isInteger(progress) || progress < 0 || progress > 100 ||
        typeof note !== 'string' || note.trim().length > 500
      ) {
        return res.status(400).json({ message: 'Enter a whole-number progress value from 0 to 100 and a note under 500 characters.' });
      }

      const project = await Project.findOne({ _id: req.params.id, assignedTo: req.user._id });
      if (!project) {
        return res.status(404).json({ message: 'Assigned project not found.' });
      }

      const reportDate = new Date();
      reportDate.setUTCHours(0, 0, 0, 0);
      const submittedAt = new Date();
      const report = await ProjectProgressReport.findOneAndUpdate(
        { project: project._id, user: req.user._id, reportDate },
        {
          $set: { progress, note: note.trim(), submittedAt },
          $setOnInsert: { project: project._id, user: req.user._id, reportDate },
        },
        { new: true, upsert: true, runValidators: true },
      );

      project.progress = progress;
      await project.save();
      await logActivity({
        actor: req.user,
        action: 'Update',
        module: 'Project',
        details: `Submitted a daily progress report for "${project.title}"`,
      });

      return res.status(201).json({ report });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'A report for this project has already been submitted today. Please try again.' });
      }
      return next(error);
    }
  },
);

module.exports = router;
