const express = require('express');
const router = express.Router();
const campusController = require('../controllers/campusController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/campuses?institution=id
router.get('/', protect, campusController.getAll);

// POST /api/campuses
router.post('/', protect, authorize('admin'), campusController.create);

// PUT /api/campuses/:id
router.put('/:id', protect, authorize('admin'), campusController.update);

// DELETE /api/campuses/:id
router.delete('/:id', protect, authorize('admin'), campusController.delete);

module.exports = router;
