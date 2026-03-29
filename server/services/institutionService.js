const Institution = require('../models/Institution');

class InstitutionService {
  async getAllInstitutions() {
    return await Institution.find().sort('name');
  }

  async createInstitution(name, code, address, city, state, userId) {
    if (!name || !code) {
      throw { status: 400, message: 'Name and code are required' };
    }
    try {
      return await Institution.create({
        name,
        code: code.toUpperCase(),
        address,
        city,
        state,
        createdBy: userId
      });
    } catch (err) {
      if (err.code === 11000) {
        throw { status: 400, message: 'Institution code already exists' };
      }
      throw err;
    }
  }

  async updateInstitution(id, name, code, address, city, state) {
    try {
      const institution = await Institution.findByIdAndUpdate(
        id,
        { name, code: code?.toUpperCase(), address, city, state },
        { new: true, runValidators: true }
      );
      if (!institution) {
        throw { status: 404, message: 'Institution not found' };
      }
      return institution;
    } catch (err) {
      if (err.code === 11000) {
        throw { status: 400, message: 'Institution code already exists' };
      }
      throw err;
    }
  }

  async deleteInstitution(id) {
    const institution = await Institution.findByIdAndDelete(id);
    if (!institution) {
      throw { status: 404, message: 'Institution not found' };
    }
    return institution;
  }
}

module.exports = new InstitutionService();
