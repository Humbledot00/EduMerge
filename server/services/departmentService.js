const Department = require('../models/Department');

class DepartmentService {
  async getAllDepartments(campusId = '') {
    const filter = {};
    if (campusId) filter.campus = campusId;
    return await Department.find(filter)
      .populate({ path: 'campus', populate: { path: 'institution', select: 'name code' } })
      .sort('name');
  }

  async createDepartment(campus, name, code) {
    if (!campus || !name || !code) {
      throw { status: 400, message: 'Campus, name, and code are required' };
    }
    try {
      const department = await Department.create({ campus, name, code });
      await department.populate({ path: 'campus', populate: { path: 'institution', select: 'name code' } });
      return department;
    } catch (err) {
      if (err.code === 11000) {
        throw { status: 400, message: 'Department code already exists for this campus' };
      }
      throw err;
    }
  }

  async updateDepartment(id, name, code) {
    try {
      const department = await Department.findByIdAndUpdate(
        id,
        { name, code },
        { new: true, runValidators: true }
      ).populate({ path: 'campus', populate: { path: 'institution', select: 'name code' } });
      if (!department) {
        throw { status: 404, message: 'Department not found' };
      }
      return department;
    } catch (err) {
      throw err;
    }
  }

  async deleteDepartment(id) {
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      throw { status: 404, message: 'Department not found' };
    }
    return department;
  }
}

module.exports = new DepartmentService();
