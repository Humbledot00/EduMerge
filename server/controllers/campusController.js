const campusService = require('../services/campusService');

class CampusController {
  async getAll(req, res) {
    try {
      const campuses = await campusService.getAllCampuses(req.query.institution);
      res.json(campuses);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const campus = await campusService.createCampus(
        req.body.institution,
        req.body.name,
        req.body.code,
        req.body.address
      );
      res.status(201).json(campus);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const campus = await campusService.updateCampus(
        req.params.id,
        req.body.name,
        req.body.code,
        req.body.address
      );
      res.json(campus);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      await campusService.deleteCampus(req.params.id);
      res.json({ message: 'Campus deleted' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new CampusController();
