const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/institutions
router.get('/', protect, institutionController.getAll);

// POST /api/institutions (admin only)
router.post('/', protect, authorize('admin'), institutionController.create);

// PUT /api/institutions/:id
router.put('/:id', protect, authorize('admin'), institutionController.update);

// DELETE /api/institutions/:id
router.delete('/:id', protect, authorize('admin'), institutionController.delete);

module.exports = router;
