const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { requireAuthentication, requireSuperAdmin } = require('./auth');
const logActivity = require('../utils/logActivity');

const router = express.Router();
const maxImageBytes = 1024 * 1024;
const isValidImage = (image) => {
  if (typeof image !== 'string' || image === '') return image === '';
  const imageMatch = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image);
  return Boolean(imageMatch && Buffer.byteLength(imageMatch[1], 'base64') <= maxImageBytes);
};

const validateProject = ({ title, category, status, progress, tech, image }) => (
  typeof title === 'string' &&
  Boolean(title.trim()) &&
  title.trim().length <= 120 &&
  typeof category === 'string' &&
  Boolean(category.trim()) &&
  category.trim().length <= 2000 &&
  ['Active', 'Completed', 'On Hold'].includes(status) &&
  Number.isFinite(Number(progress)) &&
  Number(progress) >= 0 &&
  Number(progress) <= 100 &&
  Array.isArray(tech) &&
  tech.length <= 20 &&
  tech.every((item) => typeof item === 'string' && item.trim().length <= 40) &&
  isValidImage(image)
);

const projectResponse = (project) => ({
  id: project.id,
  title: project.title,
  category: project.category,
  status: project.status,
  progress: project.progress,
  tech: project.tech,
  image: project.image,
  createdAt: project.createdAt,
  assignedTo: project.assignedTo,
});

router.use(requireAuthentication, requireSuperAdmin);

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate('assignedTo', 'fullName email role status')
      .sort({ createdAt: -1 });
    return res.json({ projects: projects.map(projectResponse) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      tech: Array.isArray(req.body.tech)
        ? req.body.tech.map((item) => typeof item === 'string' ? item.trim() : item)
        : req.body.tech,
    };
    if (!validateProject(projectData)) {
      return res.status(400).json({ message: 'Enter valid project details and an image no larger than 1 MB.' });
    }

    const project = await Project.create({
      ...projectData,
      title: projectData.title.trim(),
      category: projectData.category.trim(),
      progress: Number(projectData.progress),
    });
    await logActivity({
      actor: req.user,
      action: 'Create',
      module: 'Project',
      details: `Created project: ${project.title}`,
    });
    return res.status(201).json({ project: projectResponse(project) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const currentProject = await Project.findById(req.params.id);
    if (!currentProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const projectData = {
      title: req.body.title,
      category: req.body.category,
      status: req.body.status,
      progress: req.body.progress,
      tech: Array.isArray(req.body.tech)
        ? req.body.tech.map((item) => typeof item === 'string' ? item.trim() : item)
        : req.body.tech,
      image: req.body.image === undefined ? currentProject.image : req.body.image,
    };
    if (!validateProject(projectData)) {
      return res.status(400).json({ message: 'Enter valid project details and an image no larger than 1 MB.' });
    }

    Object.assign(currentProject, {
      ...projectData,
      title: projectData.title.trim(),
      category: projectData.category.trim(),
      progress: Number(projectData.progress),
    });
    await currentProject.save();
    await logActivity({
      actor: req.user,
      action: 'Update',
      module: 'Project',
      details: `Updated project: ${currentProject.title}`,
    });
    return res.json({ project: projectResponse(currentProject) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    await project.deleteOne();
    await logActivity({
      actor: req.user,
      action: 'Delete',
      module: 'Project',
      details: `Deleted project: ${project.title}`,
    });
    return res.json({ message: 'Project deleted.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
