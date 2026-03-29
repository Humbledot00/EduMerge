const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicantController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/applicants
router.get('/', protect, applicantController.getAll);

// POST /api/applicants
router.post('/', protect, authorize('admin', 'admission_officer'), applicantController.create);

// GET /api/applicants/:id
router.get('/:id', protect, applicantController.getById);

// PUT /api/applicants/:id
router.put('/:id', protect, authorize('admin', 'admission_officer'), applicantController.update);

// POST /api/applicants/:id/allocate
router.post('/:id/allocate', protect, authorize('admin', 'admission_officer'), applicantController.allocateSeat);

// PUT /api/applicants/:id/documents
router.put('/:id/documents', protect, authorize('admin', 'admission_officer'), applicantController.updateDocuments);

// PUT /api/applicants/:id/fee
router.put('/:id/fee', protect, authorize('admin', 'admission_officer'), applicantController.updateFee);

// POST /api/applicants/:id/confirm
router.post('/:id/confirm', protect, authorize('admin', 'admission_officer'), applicantController.confirmAdmission);

// PUT /api/applicants/:id/reject
router.put('/:id/reject', protect, authorize('admin', 'admission_officer'), applicantController.reject);

module.exports = router;
