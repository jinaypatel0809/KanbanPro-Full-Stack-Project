const express = require('express');
const Activity = require('../models/Activity');
const { requireAuthentication, requireSuperAdmin } = require('./auth');

const router = express.Router();

router.get('/', requireAuthentication, requireSuperAdmin, async (req, res, next) => {
  try {
    const [activities, total, accounts, projects, authentication, tasks] = await Promise.all([
      Activity.find().sort({ createdAt: -1 }).limit(200).lean(),
      Activity.countDocuments(),
      Activity.countDocuments({ module: 'Account' }),
      Activity.countDocuments({ module: 'Project' }),
      Activity.countDocuments({ module: 'Authentication' }),
      Activity.countDocuments({ module: 'Task' }),
    ]);

    return res.json({
      summary: { total, accounts, projects, authentication, tasks },
      activities,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
