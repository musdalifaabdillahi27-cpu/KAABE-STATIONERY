const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', requireRole('admin'), async (req, res) => {
  const staffUsers = await User.find({ role: 'staff' }).select('-password');
  res.json(staffUsers);
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { username, password, fullName } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, role: 'staff', fullName: fullName || 'Staff Member' });
  await user.save();
  res.status(201).json({ id: user._id, username: user.username, role: user.role, fullName: user.fullName });
});

module.exports = router;
