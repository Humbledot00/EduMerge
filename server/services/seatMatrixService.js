const SeatMatrix = require('../models/SeatMatrix');
const Program = require('../models/Program');

class SeatMatrixService {
  async getAllSeatMatrices(programId = '') {
    const filter = {};
    if (programId) filter.program = programId;
    return await SeatMatrix.find(filter).populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      }
    });
  }

  async getSeatMatrixById(id) {
    const matrix = await SeatMatrix.findById(id).populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      }
    });
    if (!matrix) {
      throw { status: 404, message: 'Seat matrix not found' };
    }
    return matrix;
  }

  async createSeatMatrix(programId, academicYear, quotas, supernumerary) {
    if (!programId || !academicYear) {
      throw { status: 400, message: 'Program and academic year required' };
    }

    const program = await Program.findById(programId);
    if (!program) {
      throw { status: 404, message: 'Program not found' };
    }

    const kcet = Number(quotas?.KCET?.total || 0);
    const comedk = Number(quotas?.COMEDK?.total || 0);
    const mgmt = Number(quotas?.Management?.total || 0);
    const baseTotal = kcet + comedk + mgmt;

    if (baseTotal !== program.totalIntake) {
      throw {
        status: 400,
        message: `Quota totals (${baseTotal}) must equal program intake (${program.totalIntake})`
      };
    }

    const existing = await SeatMatrix.findOne({ program: programId });
    if (existing) {
      throw { status: 400, message: 'Seat matrix already exists for this program. Use update instead.' };
    }

    const matrix = await SeatMatrix.create({
      program: programId,
      academicYear,
      quotas: {
        KCET: { total: kcet, allocated: 0 },
        COMEDK: { total: comedk, allocated: 0 },
        Management: { total: mgmt, allocated: 0 }
      },
      supernumerary: {
        total: Number(supernumerary?.total || 0),
        allocated: 0
      }
    });
    await matrix.populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      }
    });
    return matrix;
  }

  async updateSeatMatrix(id, academicYear, quotas, supernumerary) {
    const existingMatrix = await SeatMatrix.findById(id).populate('program');
    if (!existingMatrix) {
      throw { status: 404, message: 'Seat matrix not found' };
    }

    const kcet = Number(quotas?.KCET?.total ?? existingMatrix.quotas.KCET.total);
    const comedk = Number(quotas?.COMEDK?.total ?? existingMatrix.quotas.COMEDK.total);
    const mgmt = Number(quotas?.Management?.total ?? existingMatrix.quotas.Management.total);
    const baseTotal = kcet + comedk + mgmt;

    if (baseTotal !== existingMatrix.program.totalIntake) {
      throw {
        status: 400,
        message: `Quota totals (${baseTotal}) must equal program intake (${existingMatrix.program.totalIntake})`
      };
    }

    // Validation: new totals cannot be less than already allocated
    if (kcet < existingMatrix.quotas.KCET.allocated) {
      throw { status: 400, message: `KCET total cannot be less than already allocated (${existingMatrix.quotas.KCET.allocated})` };
    }
    if (comedk < existingMatrix.quotas.COMEDK.allocated) {
      throw { status: 400, message: `COMEDK total cannot be less than already allocated (${existingMatrix.quotas.COMEDK.allocated})` };
    }
    if (mgmt < existingMatrix.quotas.Management.allocated) {
      throw { status: 400, message: `Management total cannot be less than already allocated (${existingMatrix.quotas.Management.allocated})` };
    }

    const matrix = await SeatMatrix.findByIdAndUpdate(
      id,
      {
        academicYear,
        'quotas.KCET.total': kcet,
        'quotas.COMEDK.total': comedk,
        'quotas.Management.total': mgmt,
        'supernumerary.total': Number(supernumerary?.total ?? existingMatrix.supernumerary.total)
      },
      { new: true }
    ).populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      }
    });
    return matrix;
  }
}

module.exports = new SeatMatrixService();
