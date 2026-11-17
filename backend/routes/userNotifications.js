const express = require('express');
const UserNotification = require('../models/UserNotification');
const { requireAuthentication } = require('./auth');

const router = express.Router();

router.get('/user/notifications', requireAuthentication, async (req, res, next) => {
  if (req.user.role !== 'Member') {
    return res.status(403).json({ message: 'Only a user can access these notifications.' });
  }

  try {
    const notifications = await UserNotification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ notifications });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
