const programService = require('../services/programService');

class ProgramController {
  async getAll(req, res) {
    try {
      const programs = await programService.getAllPrograms(req.query.department);
      res.json(programs);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const program = await programService.createProgram(
        req.body.department,
        req.body.name,
        req.body.code,
        req.body.courseType,
        req.body.entryType,
        req.body.admissionMode,
        req.body.academicYear,
        req.body.totalIntake
      );
      res.status(201).json(program);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const program = await programService.updateProgram(
        req.params.id,
        req.body.name,
        req.body.code,
        req.body.courseType,
        req.body.entryType,
        req.body.admissionMode,
        req.body.academicYear,
        req.body.totalIntake
      );
      res.json(program);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      await programService.deleteProgram(req.params.id);
      res.json({ message: 'Program deleted' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new ProgramController();
