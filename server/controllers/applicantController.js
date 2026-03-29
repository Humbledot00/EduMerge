const applicantService = require('../services/applicantService');

class ApplicantController {
  async getAll(req, res) {
    try {
      const applicants = await applicantService.getAllApplicants(req.query);
      res.json(applicants);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const applicant = await applicantService.createApplicant(req.body, req.user._id);
      res.status(201).json(applicant);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async getById(req, res) {
    try {
      const applicant = await applicantService.getApplicantById(req.params.id);
      res.json(applicant);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const applicant = await applicantService.updateApplicant(req.params.id, req.body);
      res.json(applicant);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async allocateSeat(req, res) {
    try {
      const { applicant, remaining } = await applicantService.allocateSeat(req.params.id);
      res.json({ message: 'Seat allocated successfully', applicant, remaining });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async updateDocuments(req, res) {
    try {
      const applicant = await applicantService.updateDocumentStatus(
        req.params.id,
        req.body.documentStatus
      );
      res.json(applicant);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async updateFee(req, res) {
    try {
      const applicant = await applicantService.updateFeeStatus(req.params.id, req.body.feeStatus);
      res.json(applicant);
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async confirmAdmission(req, res) {
    try {
      const { admissionNumber, applicant } = await applicantService.confirmAdmission(req.params.id);
      res.json({ message: 'Admission confirmed successfully', admissionNumber, applicant });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }

  async reject(req, res) {
    try {
      const applicant = await applicantService.rejectApplicant(req.params.id);
      res.json({ message: 'Applicant rejected', applicant });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    }
  }
}

module.exports = new ApplicantController();
