const Activity = require('../models/Activity');

const logActivity = ({ actor, action, module, details }) => Activity.create({
  actorId: actor?._id || actor?.id || null,
  actorName: actor?.fullName || 'System',
  actorEmail: actor?.email || '',
  actorRole: actor?.role || 'System',
  action,
  module,
  details,
});

module.exports = logActivity;
