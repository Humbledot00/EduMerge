const Campus = require('../models/Campus');

class CampusService {
  async getAllCampuses(institutionId = '') {
    const filter = {};
    if (institutionId) filter.institution = institutionId;
    return await Campus.find(filter).populate('institution', 'name code').sort('name');
  }

  async createCampus(institution, name, code, address) {
    if (!institution || !name || !code) {
      throw { status: 400, message: 'Institution, name, and code are required' };
    }
    try {
      const campus = await Campus.create({ institution, name, code, address });
      await campus.populate('institution', 'name code');
      return campus;
    } catch (err) {
      if (err.code === 11000) {
        throw { status: 400, message: 'Campus code already exists for this institution' };
      }
      throw err;
    }
  }

  async updateCampus(id, name, code, address) {
    try {
      const campus = await Campus.findByIdAndUpdate(
        id,
        { name, code, address },
        { new: true, runValidators: true }
      ).populate('institution', 'name code');
      if (!campus) {
        throw { status: 404, message: 'Campus not found' };
      }
      return campus;
    } catch (err) {
      throw err;
    }
  }

  async deleteCampus(id) {
    const campus = await Campus.findByIdAndDelete(id);
    if (!campus) {
      throw { status: 404, message: 'Campus not found' };
    }
    return campus;
  }
}

module.exports = new CampusService();
