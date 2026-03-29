const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // This will be hashed!
    role: { type: String, default: 'student' }  // You can have 'teacher' later
});

module.exports = mongoose.model('user', userSchema);