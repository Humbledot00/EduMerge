const seatMatrixService = require('../services/seatMatrixService');

class SeatMatrixController {
  async getAll(req, res) {
    try {
      const matrices = await seatMatrixService.getAllSeatMatrices(req.query.program);
      res.json(matrices);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getById(req, res) {
    try {
      const matrix = await seatMatrixService.getSeatMatrixById(req.params.id);
      res.json(matrix);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const matrix = await seatMatrixService.createSeatMatrix(
        req.body.program,
        req.body.academicYear,
        req.body.quotas,
        req.body.supernumerary
      );
      res.status(201).json(matrix);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const matrix = await seatMatrixService.updateSeatMatrix(
        req.params.id,
        req.body.academicYear,
        req.body.quotas,
        req.body.supernumerary
      );
      res.json(matrix);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new SeatMatrixController();
