const mongoose = require('mongoose');

const quotaSlotSchema = {
  total: { type: Number, default: 0, min: 0 },
  allocated: { type: Number, default: 0, min: 0 }
};

const seatMatrixSchema = new mongoose.Schema({
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, unique: true },
  academicYear: { type: String, required: true },
  quotas: {
    KCET: quotaSlotSchema,
    COMEDK: quotaSlotSchema,
    Management: quotaSlotSchema
  },
  supernumerary: {
    total: { type: Number, default: 0, min: 0 },
    allocated: { type: Number, default: 0, min: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('SeatMatrix', seatMatrixSchema);
