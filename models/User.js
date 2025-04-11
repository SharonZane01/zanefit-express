const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  height: Number,
  weight: Number,
  equipment: [String], // List of equipment user has
  goal: String, // 'lose weight' or 'build muscle'
});

const User = mongoose.model('User', userSchema);

module.exports = User;
