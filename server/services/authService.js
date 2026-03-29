const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw { status: 400, message: 'Please provide email and password' };
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw { status: 401, message: 'Invalid email or password' };
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: this.generateToken(user._id)
    };
  }

  async register(name, email, password, role) {
    if (!name || !email || !password || !role) {
      throw { status: 400, message: 'All fields required' };
    }
    const exists = await User.findOne({ email });
    if (exists) {
      throw { status: 400, message: 'Email already exists' };
    }
    const user = await User.create({ name, email, password, role });
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async getMe(userId) {
    return await User.findById(userId);
  }

  async getAllUsers() {
    return await User.find().select('-password').sort('name');
  }

  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }
}

module.exports = new AuthService();
