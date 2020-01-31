const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  googleId: String,
  email: String,
  name: String
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;