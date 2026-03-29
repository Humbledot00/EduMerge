const SeatMatrix = require('../models/SeatMatrix');
const Applicant = require('../models/Applicant');

class DashboardService {
  async getDashboardStats(academicYear = '') {
    const applicantFilter = {};
    if (academicYear) applicantFilter.academicYear = academicYear;

    // Seat matrix overview (all programs)
    const seatMatrices = await SeatMatrix.find().populate({
      path: 'program',
      populate: {
        path: 'department',
        populate: { path: 'campus', populate: { path: 'institution', select: 'name code' } }
      }
    });

    const programStats = seatMatrices.map(sm => {
      const totalAllocated =
        sm.quotas.KCET.allocated + sm.quotas.COMEDK.allocated + sm.quotas.Management.allocated;
      return {
        _id: sm._id,
        program: {
          _id: sm.program._id,
          name: sm.program.name,
          code: sm.program.code,
          courseType: sm.program.courseType,
          totalIntake: sm.program.totalIntake
        },
        department: sm.program.department?.name,
        campus: sm.program.department?.campus?.name,
        institution: sm.program.department?.campus?.institution?.name,
        academicYear: sm.academicYear,
        totalIntake: sm.program.totalIntake,
        totalAllocated,
        remaining: sm.program.totalIntake - totalAllocated,
        quotas: {
          KCET: {
            total: sm.quotas.KCET.total,
            allocated: sm.quotas.KCET.allocated,
            remaining: sm.quotas.KCET.total - sm.quotas.KCET.allocated
          },
          COMEDK: {
            total: sm.quotas.COMEDK.total,
            allocated: sm.quotas.COMEDK.allocated,
            remaining: sm.quotas.COMEDK.total - sm.quotas.COMEDK.allocated
          },
          Management: {
            total: sm.quotas.Management.total,
            allocated: sm.quotas.Management.allocated,
            remaining: sm.quotas.Management.total - sm.quotas.Management.allocated
          }
        },
        supernumerary: sm.supernumerary
      };
    });

    // Summary counts
    const [totalApplicants, confirmedAdmissions, pendingDocs, pendingFees, seatAllocated] = await Promise.all([
      Applicant.countDocuments(applicantFilter),
      Applicant.countDocuments({ ...applicantFilter, status: 'confirmed' }),
      Applicant.countDocuments({
        ...applicantFilter,
        seatAllocated: true,
        documentStatus: { $ne: 'verified' }
      }),
      Applicant.countDocuments({ ...applicantFilter, seatAllocated: true, feeStatus: 'pending' }),
      Applicant.countDocuments({ ...applicantFilter, seatAllocated: true })
    ]);

    // Quota-wise applicant breakdown
    const quotaBreakdown = await Applicant.aggregate([
      { $match: applicantFilter },
      {
        $group: {
          _id: '$quotaType',
          count: { $sum: 1 },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } }
        }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await Applicant.aggregate([
      { $match: applicantFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return {
      programStats,
      summary: { totalApplicants, confirmedAdmissions, pendingDocs, pendingFees, seatAllocated },
      quotaBreakdown,
      statusBreakdown
    };
  }
}

module.exports = new DashboardService();
