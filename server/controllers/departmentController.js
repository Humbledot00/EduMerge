const departmentService = require('../services/departmentService');

class DepartmentController {
  async getAll(req, res) {
    try {
      const departments = await departmentService.getAllDepartments(req.query.campus);
      res.json(departments);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const department = await departmentService.createDepartment(
        req.body.campus,
        req.body.name,
        req.body.code
      );
      res.status(201).json(department);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const department = await departmentService.updateDepartment(
        req.params.id,
        req.body.name,
        req.body.code
      );
      res.json(department);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      await departmentService.deleteDepartment(req.params.id);
      res.json({ message: 'Department deleted' });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new DepartmentController();
