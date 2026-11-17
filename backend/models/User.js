const crypto = require('crypto');
const { promisify } = require('util');
const mongoose = require('mongoose');

const scrypt = promisify(crypto.scrypt);

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['Member', 'Admin', 'Super Admin'],
  },
  profilePhoto: {
    type: String,
    required: true,
    maxlength: 1400000,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  theme: {
    type: String,
    enum: ['Light', 'Dark', 'System'],
    default: 'System',
  },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(this.password, salt, 64);
  this.password = `${salt}:${hash.toString('hex')}`;
});

userSchema.methods.comparePassword = async function comparePassword(password) {
  const [salt, storedHash] = this.password.split(':');
  if (!salt || !storedHash) return false;
  const expected = Buffer.from(storedHash, 'hex');
  const actual = await scrypt(password, salt, 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

module.exports = mongoose.model('User', userSchema);
