const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['ProjectAssigned', 'TaskAssigned'],
    required: true,
  },
}, { timestamps: true });

userNotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('UserNotification', userNotificationSchema);
