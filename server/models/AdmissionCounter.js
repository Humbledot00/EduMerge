const mongoose = require('mongoose');

// Tracks sequential admission number per (institution+year+courseType+programCode+quota)
const admissionCounterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('AdmissionCounter', admissionCounterSchema);
