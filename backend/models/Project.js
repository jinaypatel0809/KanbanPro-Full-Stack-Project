const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold'],
    default: 'Active',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  tech: {
    type: [String],
    default: [],
  },
  image: {
    type: String,
    default: '',
    maxlength: 1400000,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
