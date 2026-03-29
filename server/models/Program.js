const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  courseType: { type: String, enum: ['UG', 'PG'], required: true },
  entryType: { type: String, enum: ['Regular', 'Lateral'], default: 'Regular' },
  admissionMode: { type: String, enum: ['Government', 'Management', 'Both'], default: 'Both' },
  academicYear: { type: String, required: true },
  totalIntake: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
