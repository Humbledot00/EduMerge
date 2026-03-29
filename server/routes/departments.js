const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/departments?campus=id
router.get('/', protect, departmentController.getAll);

// POST /api/departments
router.post('/', protect, authorize('admin'), departmentController.create);

// PUT /api/departments/:id
router.put('/:id', protect, authorize('admin'), departmentController.update);

// DELETE /api/departments/:id
router.delete('/:id', protect, authorize('admin'), departmentController.delete);

module.exports = router;
