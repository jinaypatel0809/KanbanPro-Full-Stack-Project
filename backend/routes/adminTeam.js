const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const { requireAuthentication } = require('./auth');

const router = express.Router();

router.get('/admin/team', requireAuthentication, async (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only an Admin can access team members.' });
  }

  try {
    const [members, projects] = await Promise.all([
      User.find({ role: 'Member' })
        .select('fullName email role status createdAt')
        .sort({ createdAt: -1 })
        .lean(),
      Project.find().select('title assignedTo').lean(),
    ]);

    const projectsByMember = new Map();
    projects.forEach((project) => {
      if (!project.assignedTo) return;
      const memberId = project.assignedTo.toString();
      const memberProjects = projectsByMember.get(memberId) || [];
      memberProjects.push(project.title);
      projectsByMember.set(memberId, memberProjects);
    });

    const teamMembers = members.map((member) => ({
      ...member,
      projects: projectsByMember.get(member._id.toString()) || [],
    }));

    return res.json({
      teamMembers,
      summary: {
        totalMembers: teamMembers.length,
        activeMembers: teamMembers.filter((member) => (member.status || 'Active') === 'Active').length,
        inactiveMembers: teamMembers.filter((member) => member.status === 'Inactive').length,
        projects: projects.length,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
