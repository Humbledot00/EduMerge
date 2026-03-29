const Applicant = require('../models/Applicant');
const SeatMatrix = require('../models/SeatMatrix');
const AdmissionCounter = require('../models/AdmissionCounter');

class ApplicantService {
  async getAllApplicants(filters = {}) {
    const query = {};
    if (filters.program) query.program = filters.program;
    if (filters.quotaType) query.quotaType = filters.quotaType;
    if (filters.status) query.status = filters.status;
    if (filters.documentStatus) query.documentStatus = filters.documentStatus;
    if (filters.feeStatus) query.feeStatus = filters.feeStatus;
    if (filters.academicYear) query.academicYear = filters.academicYear;
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { allotmentNumber: { $regex: filters.search, $options: 'i' } },
        { admissionNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }
    return await Applicant.find(query)
      .populate('program', 'name code courseType academicYear')
      .populate('createdBy', 'name')
      .sort('-createdAt');
  }

  async createApplicant(data, userId) {
    try {
      const applicant = await Applicant.create({ ...data, createdBy: userId });
      await applicant.populate('program', 'name code courseType');
      return applicant;
    } catch (err) {
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        throw { status: 400, message: messages.join(', ') };
      }
      throw err;
    }
  }

  async getApplicantById(id) {
    const applicant = await Applicant.findById(id)
      .populate({
        path: 'program',
        populate: {
          path: 'department',
          populate: { path: 'campus', populate: { path: 'institution' } }
        }
      })
      .populate('createdBy', 'name email');
    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }
    return applicant;
  }

  async updateApplicant(id, updates) {
    const applicant = await Applicant.findById(id);
    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }

    if (applicant.admissionNumber) {
      throw { status: 400, message: 'Cannot edit a confirmed applicant' };
    }

    const allowed = [
      'firstName', 'lastName', 'dob', 'gender', 'email', 'phone', 'address',
      'category', 'entryType', 'qualifyingExam', 'marks', 'allotmentNumber', 'academicYear'
    ];
    const finalUpdates = {};
    allowed.forEach(field => {
      if (updates[field] !== undefined) finalUpdates[field] = updates[field];
    });

    Object.assign(applicant, finalUpdates);
    await applicant.save();
    await applicant.populate('program', 'name code courseType');
    return applicant;
  }

  async allocateSeat(applicantId) {
    const applicant = await Applicant.findById(applicantId).populate('program');
    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }
    if (applicant.seatAllocated) {
      throw { status: 400, message: 'Seat is already allocated' };
    }

    const seatMatrix = await SeatMatrix.findOne({ program: applicant.program._id });
    if (!seatMatrix) {
      throw { status: 404, message: 'Seat matrix not configured for this program' };
    }

    const quota = applicant.quotaType;
    const quotaData = seatMatrix.quotas[quota];
    if (!quotaData) {
      throw { status: 400, message: `Invalid quota type: ${quota}` };
    }

    // Atomic update: only increment if allocated < total
    const updated = await SeatMatrix.findOneAndUpdate(
      {
        _id: seatMatrix._id,
        [`quotas.${quota}.allocated`]: { $lt: quotaData.total }
      },
      { $inc: { [`quotas.${quota}.allocated`]: 1 } },
      { new: true }
    );

    if (!updated) {
      throw {
        status: 400,
        message: `No seats available in ${quota} quota. Quota is full (${quotaData.allocated}/${quotaData.total})`
      };
    }

    applicant.seatAllocated = true;
    applicant.status = 'seat_allocated';
    await applicant.save();
    await applicant.populate('program', 'name code courseType');

    return {
      applicant,
      remaining: updated.quotas[quota].total - updated.quotas[quota].allocated
    };
  }

  async updateDocumentStatus(applicantId, documentStatus) {
    const validStatuses = ['pending', 'submitted', 'verified'];
    if (!validStatuses.includes(documentStatus)) {
      throw { status: 400, message: 'Invalid document status' };
    }
    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
      { documentStatus },
      { new: true }
    ).populate('program', 'name code courseType');
    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }
    return applicant;
  }

  async updateFeeStatus(applicantId, feeStatus) {
    if (!['pending', 'paid'].includes(feeStatus)) {
      throw { status: 400, message: 'Invalid fee status' };
    }
    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
      { feeStatus },
      { new: true }
    ).populate('program', 'name code courseType');
    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }
    return applicant;
  }

  async confirmAdmission(applicantId) {
    const applicant = await Applicant.findById(applicantId).populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution' } }
      }
    });

    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }
    if (!applicant.seatAllocated) {
      throw { status: 400, message: 'Seat must be allocated before admission confirmation' };
    }
    if (applicant.feeStatus !== 'paid') {
      throw { status: 400, message: 'Fee must be paid before admission confirmation' };
    }
    if (applicant.admissionNumber) {
      throw { status: 400, message: `Admission already confirmed: ${applicant.admissionNumber}` };
    }

    const prog = applicant.program;
    const institution = prog.department.campus.institution;
    const instCode = institution.code.toUpperCase();
    const year = applicant.academicYear;
    const courseType = prog.courseType.toUpperCase();
    const progCode = prog.code.toUpperCase();
    const quota = applicant.quotaType.toUpperCase();

    const counterKey = `${instCode}_${year}_${courseType}_${progCode}_${quota}`;

    // Atomic increment of counter
    const counter = await AdmissionCounter.findOneAndUpdate(
      { key: counterKey },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    const seq = String(counter.count).padStart(4, '0');
    const admissionNumber = `${instCode}/${year}/${courseType}/${progCode}/${quota}/${seq}`;

    applicant.admissionNumber = admissionNumber;
    applicant.status = 'confirmed';
    await applicant.save();

    return { admissionNumber, applicant };
  }

  async rejectApplicant(applicantId) {
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      throw { status: 404, message: 'Applicant not found' };
    }
    if (applicant.admissionNumber) {
      throw { status: 400, message: 'Cannot reject a confirmed admission' };
    }

    // Release seat if allocated
    if (applicant.seatAllocated) {
      await SeatMatrix.findOneAndUpdate(
        { program: applicant.program },
        { $inc: { [`quotas.${applicant.quotaType}.allocated`]: -1 } }
      );
    }

    applicant.status = 'rejected';
    applicant.seatAllocated = false;
    await applicant.save();
    return applicant;
  }
}

module.exports = new ApplicantService();
