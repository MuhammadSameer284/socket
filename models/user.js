const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
});

module.exports = mongoose.model('user', userSchema);