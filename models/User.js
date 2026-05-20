const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'staff', 'customer'] },
  fullName: { type: String, default: 'User' },
});

module.exports = mongoose.model('User', userSchema);
