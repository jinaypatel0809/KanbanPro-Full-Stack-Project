const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  actorName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  actorEmail: {
    type: String,
    default: '',
    maxlength: 254,
  },
  actorRole: {
    type: String,
    default: 'System',
    maxlength: 30,
  },
  action: {
    type: String,
    required: true,
    enum: ['Login', 'Register', 'Create', 'Update', 'Delete'],
  },
  module: {
    type: String,
    required: true,
    enum: ['Authentication', 'Account', 'Project', 'Task'],
  },
  details: {
    type: String,
    required: true,
    maxlength: 500,
  },
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
