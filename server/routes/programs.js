const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/programs?department=id
router.get('/', protect, programController.getAll);

// POST /api/programs
router.post('/', protect, authorize('admin'), programController.create);

// PUT /api/programs/:id
router.put('/:id', protect, authorize('admin'), programController.update);

// DELETE /api/programs/:id
router.delete('/:id', protect, authorize('admin'), programController.delete);

module.exports = router;
