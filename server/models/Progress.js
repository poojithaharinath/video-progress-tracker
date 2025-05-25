
const mongoose = require('mongoose');
const progressSchema = new mongoose.Schema({
  userId: String,
  videoId: String,
  intervals: [{ start: Number, end: Number }],
  lastPosition: Number,
  progress: Number
});
module.exports = mongoose.model('Progress', progressSchema);
