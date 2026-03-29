const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  campus: { type: mongoose.Schema.Types.ObjectId, ref: 'Campus', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true }
}, { timestamps: true });

departmentSchema.index({ campus: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
