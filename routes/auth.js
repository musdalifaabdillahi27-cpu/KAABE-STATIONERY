const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await User.findOne({ username: username.trim() });
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '8h' }
  );

  res.json({ token, role: user.role, fullName: user.fullName });
});

module.exports = router;
