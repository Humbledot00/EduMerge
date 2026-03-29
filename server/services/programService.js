const Program = require('../models/Program');

class ProgramService {
  async getAllPrograms(departmentId = '') {
    const filter = {};
    if (departmentId) filter.department = departmentId;
    return await Program.find(filter)
      .populate({
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      })
      .sort('name');
  }

  async createProgram(department, name, code, courseType, entryType, admissionMode, academicYear, totalIntake) {
    if (!department || !name || !code || !courseType || !academicYear || !totalIntake) {
      throw { status: 400, message: 'All required fields must be provided' };
    }
    try {
      const program = await Program.create({
        department,
        name,
        code: code.toUpperCase(),
        courseType,
        entryType,
        admissionMode,
        academicYear,
        totalIntake: Number(totalIntake)
      });
      await program.populate({
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      });
      return program;
    } catch (err) {
      throw err;
    }
  }

  async updateProgram(id, name, code, courseType, entryType, admissionMode, academicYear, totalIntake) {
    try {
      const program = await Program.findByIdAndUpdate(
        id,
        {
          name,
          code: code?.toUpperCase(),
          courseType,
          entryType,
          admissionMode,
          academicYear,
          totalIntake: Number(totalIntake)
        },
        { new: true, runValidators: true }
      ).populate({
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      });
      if (!program) {
        throw { status: 404, message: 'Program not found' };
      }
      return program;
    } catch (err) {
      throw err;
    }
  }

  async deleteProgram(id) {
    const program = await Program.findByIdAndDelete(id);
    if (!program) {
      throw { status: 404, message: 'Program not found' };
    }
    return program;
  }
}

module.exports = new ProgramService();
