const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  // Personal Details (15 fields max in form)
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  // Academic
  category: { type: String, enum: ['GM', 'SC', 'ST', 'OBC', '2A', '2B', '3A', '3B'], required: true },
  entryType: { type: String, enum: ['Regular', 'Lateral'], required: true },
  quotaType: { type: String, enum: ['KCET', 'COMEDK', 'Management'], required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  qualifyingExam: { type: String, trim: true },
  marks: { type: Number, min: 0, max: 100 },
  allotmentNumber: { type: String, trim: true }, // for KCET/COMEDK govt allotment
  academicYear: { type: String, required: true },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'seat_allocated', 'documents_verified', 'fee_paid', 'confirmed', 'rejected'],
    default: 'pending'
  },
  documentStatus: {
    type: String,
    enum: ['pending', 'submitted', 'verified'],
    default: 'pending'
  },
  feeStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  seatAllocated: { type: Boolean, default: false },
  admissionNumber: { type: String, unique: true, sparse: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Applicant', applicantSchema);
