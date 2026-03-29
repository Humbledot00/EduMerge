const express = require('express');
const router = express.Router();
const seatMatrixController = require('../controllers/seatMatrixController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/seat-matrix?program=id
router.get('/', protect, seatMatrixController.getAll);

// GET /api/seat-matrix/:id
router.get('/:id', protect, seatMatrixController.getById);

// POST /api/seat-matrix
router.post('/', protect, authorize('admin'), seatMatrixController.create);

// PUT /api/seat-matrix/:id
router.put('/:id', protect, authorize('admin'), seatMatrixController.update);

module.exports = router;
