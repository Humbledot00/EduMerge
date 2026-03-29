const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getStats(req, res) {
    try {
      const stats = await dashboardService.getDashboardStats(req.query.academicYear);
      res.json(stats);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new DashboardController();
