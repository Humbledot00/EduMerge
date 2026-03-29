const institutionService = require('../services/institutionService');

class InstitutionController {
  async getAll(req, res) {
    try {
      const institutions = await institutionService.getAllInstitutions();
      res.json(institutions);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const institution = await institutionService.createInstitution(
        req.body.name,
        req.body.code,
        req.body.address,
        req.body.city,
        req.body.state,
        req.user._id
      );
      res.status(201).json(institution);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const institution = await institutionService.updateInstitution(
        req.params.id,
        req.body.name,
        req.body.code,
        req.body.address,
        req.body.city,
        req.body.state
      );
      res.json(institution);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      await institutionService.deleteInstitution(req.params.id);
      res.json({ message: 'Institution deleted' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new InstitutionController();
