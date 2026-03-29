const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async register(req, res) {
    try {
      const result = await authService.register(req.body.name, req.body.email, req.body.password, req.body.role);
      res.status(201).json(result);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await authService.getMe(req.user._id);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await authService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new AuthController();
