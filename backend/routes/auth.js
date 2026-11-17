const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const logActivity = require('../utils/logActivity');

const router = express.Router();
const roles = ['Member', 'Admin', 'Super Admin'];
const maxProfilePhotoBytes = 1024 * 1024;
const jwtSecret = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' ? undefined : crypto.randomBytes(32).toString('hex')
);

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set in the backend environment in production.');
}

const base64Url = (value) => Buffer.from(value)
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const createToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    sub: user.id,
    role: user.role,
    iat: now,
    exp: now + 86400,
  }));
  const unsignedToken = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', jwtSecret)
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${unsignedToken}.${signature}`;
};

const verifyToken = (token) => {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) return null;

  const unsignedToken = `${header}.${payload}`;
  const expectedSignature = crypto.createHmac('sha256', jwtSecret)
    .update(unsignedToken)
    .digest();
  const suppliedSignature = Buffer.from(
    signature.replace(/-/g, '+').replace(/_/g, '/'),
    'base64',
  );
  if (
    expectedSignature.length !== suppliedSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, suppliedSignature)
  ) {
    return null;
  }

  try {
    const tokenHeader = JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
    const tokenPayload = JSON.parse(Buffer.from(
      payload.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    ).toString('utf8'));
    if (tokenHeader.alg !== 'HS256' || tokenPayload.exp <= Date.now() / 1000) return null;
    return tokenPayload;
  } catch {
    return null;
  }
};

const requireAuthentication = async (req, res, next) => {
  const authorization = req.get('authorization') || '';
  if (!authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  try {
    const tokenPayload = verifyToken(authorization.slice(7));
    if (!tokenPayload) {
      return res.status(401).json({ message: 'Your session is invalid or expired.' });
    }

    const user = await User.findById(tokenPayload.sub);
    if (!user || user.role !== tokenPayload.role || user.status === 'Inactive') {
      return res.status(401).json({ message: 'Your session is no longer valid.' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

const userResponse = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  profilePhoto: user.profilePhoto || '',
  status: user.status || 'Active',
  theme: user.theme || 'System',
  createdAt: user.createdAt,
});

const isValidProfilePhoto = (profilePhoto) => {
  if (typeof profilePhoto !== 'string') return false;
  const photoMatch = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(profilePhoto);
  return photoMatch && Buffer.byteLength(photoMatch[1], 'base64') <= maxProfilePhotoBytes;
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Only a Super Admin can manage admin accounts.' });
  }
  return next();
};

const updateAccount = async (req, res, next, allowedRoles, responseKey) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      status,
      profilePhoto,
    } = req.body;
    if (
      typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      (password !== undefined && password !== '' &&
        (typeof password !== 'string' || password.length < 8)) ||
      !allowedRoles.includes(role) ||
      !['Active', 'Inactive'].includes(status) ||
      (profilePhoto !== undefined && profilePhoto !== '' && !isValidProfilePhoto(profilePhoto))
    ) {
      return res.status(400).json({
        message: 'Enter valid account details. A new password must be at least 8 characters and an image must be under 1 MB.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    const account = await User.findById(req.params.id);
    if (!account || !allowedRoles.includes(account.role)) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    if (account.id === req.user.id && role !== account.role) {
      return res.status(400).json({ message: 'You cannot change your own account role.' });
    }

    account.fullName = fullName.trim();
    account.email = email.trim().toLowerCase();
    account.role = role;
    account.status = status;
    if (password) account.password = password;
    if (profilePhoto) account.profilePhoto = profilePhoto;
    await account.save();
    await logActivity({
      actor: req.user,
      action: 'Update',
      module: 'Account',
      details: `Updated ${account.role} account: ${account.fullName}`,
    });

    return res.json({ [responseKey]: userResponse(account) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return next(error);
  }
};

const deleteAccount = async (req, res, next, allowedRoles) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    const account = await User.findById(req.params.id);
    if (!account || !allowedRoles.includes(account.role)) {
      return res.status(404).json({ message: 'Account not found.' });
    }
    if (account.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    await account.deleteOne();
    await logActivity({
      actor: req.user,
      action: 'Delete',
      module: 'Account',
      details: `Deleted ${account.role} account: ${account.fullName}`,
    });
    return res.json({ message: 'Account deleted.' });
  } catch (error) {
    return next(error);
  }
};

router.get('/me', requireAuthentication, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

router.patch('/me', requireAuthentication, async (req, res, next) => {
  try {
    const {
      fullName,
      profilePhoto,
      currentPassword,
      newPassword,
      theme,
    } = req.body;
    const passwordRequested = newPassword !== undefined && newPassword !== '';

    if (
      (fullName !== undefined &&
        (typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 100)) ||
      (profilePhoto !== undefined && !isValidProfilePhoto(profilePhoto)) ||
      (theme !== undefined && !['Light', 'Dark', 'System'].includes(theme)) ||
      (passwordRequested && (
        typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string' ||
        newPassword.length < 8
      )) ||
      (!passwordRequested && currentPassword !== undefined && currentPassword !== '')
    ) {
      return res.status(400).json({
        message: 'Enter a valid name, supported profile photo up to 1 MB, theme, or a new password of at least 8 characters with your current password.',
      });
    }

    const account = passwordRequested
      ? await User.findById(req.user._id).select('+password')
      : await User.findById(req.user._id);
    if (!account) {
      return res.status(401).json({ message: 'Your account could not be found.' });
    }
    if (passwordRequested && !(await account.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Your current password is incorrect.' });
    }

    if (fullName !== undefined) account.fullName = fullName.trim();
    if (profilePhoto !== undefined) account.profilePhoto = profilePhoto;
    if (passwordRequested) account.password = newPassword;
    if (theme !== undefined) account.theme = theme;
    await account.save();
    await logActivity({
      actor: account,
      action: 'Update',
      module: 'Account',
      details: 'Updated own profile or settings',
    });

    return res.json({ user: userResponse(account) });
  } catch (error) {
    return next(error);
  }
});

router.get('/users', requireAuthentication, requireSuperAdmin, async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['Member', 'Admin'] } })
      .sort({ createdAt: -1 });
    return res.json({ users: users.map(userResponse) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/users/:id', requireAuthentication, requireSuperAdmin, (req, res, next) => (
  updateAccount(req, res, next, ['Member', 'Admin'], 'user')
));

router.delete('/users/:id', requireAuthentication, requireSuperAdmin, (req, res, next) => (
  deleteAccount(req, res, next, ['Member', 'Admin'])
));

router.post('/users', requireAuthentication, requireSuperAdmin, async (req, res, next) => {
  try {
    const { fullName, email, password, role, status, profilePhoto } = req.body;
    if (
      typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 ||
      !['Member', 'Admin'].includes(role) ||
      !['Active', 'Inactive'].includes(status) ||
      !isValidProfilePhoto(profilePhoto)
    ) {
      return res.status(400).json({
        message: 'Enter valid user details, a password of at least 8 characters, and a supported image up to 1 MB.',
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      status,
      profilePhoto,
    });

    await logActivity({
      actor: req.user,
      action: 'Create',
      module: 'Account',
      details: `Created ${user.role} account: ${user.fullName}`,
    });
    return res.status(201).json({ user: userResponse(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return next(error);
  }
});

router.get('/admins', requireAuthentication, requireSuperAdmin, async (req, res, next) => {
  try {
    const admins = await User.find({ role: { $in: ['Admin', 'Super Admin'] } })
      .sort({ createdAt: -1 });
    return res.json({ admins: admins.map(userResponse) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/admins/:id', requireAuthentication, requireSuperAdmin, (req, res, next) => (
  updateAccount(req, res, next, ['Admin', 'Super Admin'], 'admin')
));

router.delete('/admins/:id', requireAuthentication, requireSuperAdmin, (req, res, next) => (
  deleteAccount(req, res, next, ['Admin', 'Super Admin'])
));

router.post('/admins', requireAuthentication, requireSuperAdmin, async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      status,
      profilePhoto,
    } = req.body;
    if (
      typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 ||
      !['Admin', 'Super Admin'].includes(role) ||
      !['Active', 'Inactive'].includes(status) ||
      !isValidProfilePhoto(profilePhoto)
    ) {
      return res.status(400).json({
        message: 'Enter valid admin details, a password of at least 8 characters, and a supported image up to 1 MB.',
      });
    }

    const admin = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      status,
      profilePhoto,
    });
    await logActivity({
      actor: req.user,
      action: 'Create',
      module: 'Account',
      details: `Created ${admin.role} account: ${admin.fullName}`,
    });
    return res.status(201).json({ admin: userResponse(admin) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password, role, profilePhoto } = req.body;
    if (
      typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 ||
      !roles.includes(role) ||
      !isValidProfilePhoto(profilePhoto)
    ) {
      return res.status(400).json({
        message: 'Enter valid details, select a supported profile photo up to 1 MB, and use a password of at least 8 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role,
      profilePhoto,
      status: 'Active',
    });

    await logActivity({
      actor: user,
      action: 'Register',
      module: 'Authentication',
      details: `Registered a ${user.role} account`,
    });
    return res.status(201).json({ user: userResponse(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !roles.includes(role)
    ) {
      return res.status(400).json({ message: 'Email, password, and a valid role are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (
      !user ||
      !(await user.comparePassword(password)) ||
      user.role !== role ||
      user.status === 'Inactive'
    ) {
      return res.status(401).json({ message: 'Email, password, or role is incorrect.' });
    }

    await logActivity({
      actor: user,
      action: 'Login',
      module: 'Authentication',
      details: 'Logged in successfully',
    });
    return res.json({
      token: createToken(user),
      user: userResponse(user),
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = {
  router,
  requireAuthentication,
  requireSuperAdmin,
};
