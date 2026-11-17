const mongoose = require('mongoose');

const projectProgressReportSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportDate: {
    type: Date,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    validate: Number.isInteger,
  },
  note: {
    type: String,
    default: '',
    maxlength: 500,
  },
  submittedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

projectProgressReportSchema.index(
  { project: 1, user: 1, reportDate: 1 },
  { unique: true },
);

module.exports = mongoose.model('ProjectProgressReport', projectProgressReportSchema);
