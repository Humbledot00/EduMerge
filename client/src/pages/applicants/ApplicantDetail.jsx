import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, UserCheck, FileCheck, CreditCard, GraduationCap, AlertTriangle } from 'lucide-react';

const STATUS_BADGE = {
  pending:            'badge-gray',
  seat_allocated:     'badge-blue',
  documents_verified: 'badge-purple',
  fee_paid:           'badge-yellow',
  confirmed:          'badge-green',
  rejected:           'badge-red'
};

const STATUS_LABEL = {
  pending: 'Pending', seat_allocated: 'Seat Allocated', documents_verified: 'Docs Verified',
  fee_paid: 'Fee Paid', confirmed: 'Confirmed', rejected: 'Rejected'
};

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
    <p className="text-sm text-gray-800 mt-0.5 font-medium">{value || '—'}</p>
  </div>
);

export default function ApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [seatMatrix, setSeatMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/applicants/${id}`);
      setApplicant(data);
      if (data.program?._id) {
        const { data: sm } = await api.get(`/seat-matrix?program=${data.program._id}`);
        setSeatMatrix(sm[0] || null);
      }
    } catch { toast.error('Failed to load applicant'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const doAction = async (action, endpoint, method = 'post', body = {}) => {
    setActionLoading(action);
    try {
      const call = method === 'post'
        ? api.post(endpoint, body)
        : api.put(endpoint, body);
      const { data } = await call;
      toast.success(data.message || 'Done');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setActionLoading(''); }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  }
  if (!applicant) return <p className="text-center text-gray-500 mt-20">Applicant not found.</p>;

  const a = applicant;
  const program = a.program;
  const institution = program?.department?.campus?.institution;

  const quota = a.quotaType;
  const qd = seatMatrix?.quotas?.[quota];
  const seatsAvailable = qd ? (qd.total - qd.allocated) > 0 : false;

  const canAllocate = !a.seatAllocated && a.status !== 'rejected' && seatsAvailable;
  const canConfirm  = a.seatAllocated && a.feeStatus === 'paid' && !a.admissionNumber;
  const isConfirmed = a.status === 'confirmed';
  const isRejected  = a.status === 'rejected';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{a.firstName} {a.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
              {a.admissionNumber && (
                <span className="badge badge-green font-mono font-semibold">{a.admissionNumber}</span>
              )}
            </div>
          </div>
        </div>
        {!isConfirmed && !isRejected && (
          <Link to={`/applicants/${id}/edit`} className="btn-secondary">
            <Pencil size={16} /> Edit
          </Link>
        )}
      </div>

      {/* Admission number highlight */}
      {a.admissionNumber && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <GraduationCap size={24} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Admission Confirmed</p>
            <p className="text-lg font-bold font-mono text-green-700">{a.admissionNumber}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Personal Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Email"    value={a.email} />
              <Field label="Phone"    value={a.phone} />
              <Field label="Gender"   value={a.gender} />
              <Field label="DOB"      value={a.dob ? new Date(a.dob).toLocaleDateString() : ''} />
              <Field label="Category" value={a.category} />
              <Field label="Address"  value={a.address} />
            </div>
          </div>

          {/* Academic */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Academic & Admission Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Program"          value={`${program?.name} (${program?.code})`} />
              <Field label="Course Type"      value={program?.courseType} />
              <Field label="Department"       value={program?.department?.name} />
              <Field label="Campus"           value={program?.department?.campus?.name} />
              <Field label="Institution"      value={institution?.name} />
              <Field label="Academic Year"    value={a.academicYear} />
              <Field label="Quota Type"       value={a.quotaType} />
              <Field label="Entry Type"       value={a.entryType} />
              <Field label="Qualifying Exam"  value={a.qualifyingExam} />
              <Field label="Marks %"          value={a.marks} />
              {a.allotmentNumber && <Field label="Allotment #" value={a.allotmentNumber} />}
            </div>
          </div>

          {/* Seat availability info */}
          {seatMatrix && !a.seatAllocated && (
            <div className="card p-4 bg-blue-50 border border-blue-100">
              <h2 className="font-semibold text-blue-800 mb-2 text-sm">Seat Availability — {quota} Quota</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-blue-700">Total: <strong>{qd?.total}</strong></span>
                <span className="text-blue-700">Allocated: <strong>{qd?.allocated}</strong></span>
                <span className={seatsAvailable ? 'text-green-700' : 'text-red-700'}>
                  Remaining: <strong>{(qd?.total || 0) - (qd?.allocated || 0)}</strong>
                </span>
              </div>
              {!seatsAvailable && (
                <div className="flex items-center gap-2 mt-2 text-red-700 text-sm">
                  <AlertTriangle size={16} /> {quota} quota is FULL — cannot allocate seat
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          {/* Seat Allocation */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <UserCheck size={18} className="text-indigo-500" /> Seat Allocation
            </h3>
            {a.seatAllocated ? (
              <span className="badge badge-green w-full justify-center py-2">Seat Allocated ✓</span>
            ) : isRejected ? (
              <span className="badge badge-red w-full justify-center py-2">Rejected</span>
            ) : (
              <button
                onClick={() => doAction('allocate', `/applicants/${id}/allocate`)}
                disabled={!canAllocate || !!actionLoading}
                className={`w-full ${canAllocate ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
              >
                {actionLoading === 'allocate' ? 'Allocating…' : canAllocate ? 'Allocate Seat' : 'Quota Full'}
              </button>
            )}
          </div>

          {/* Document Status */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileCheck size={18} className="text-blue-500" /> Document Status
            </h3>
            <select
              className="form-select mb-2"
              value={a.documentStatus}
              onChange={e => doAction('docs', `/applicants/${id}/documents`, 'put', { documentStatus: e.target.value })}
              disabled={isConfirmed || !!actionLoading}
            >
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
            </select>
            <div className={`badge w-full justify-center py-1.5
              ${a.documentStatus === 'verified' ? 'badge-green' : a.documentStatus === 'submitted' ? 'badge-blue' : 'badge-yellow'}`}>
              {a.documentStatus}
            </div>
          </div>

          {/* Fee Status */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-green-500" /> Fee Status
            </h3>
            <select
              className="form-select mb-2"
              value={a.feeStatus}
              onChange={e => doAction('fee', `/applicants/${id}/fee`, 'put', { feeStatus: e.target.value })}
              disabled={isConfirmed || !!actionLoading}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            <div className={`badge w-full justify-center py-1.5 ${a.feeStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
              {a.feeStatus}
            </div>
          </div>

          {/* Confirm Admission */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <GraduationCap size={18} className="text-purple-500" /> Admission Confirmation
            </h3>
            {isConfirmed ? (
              <div className="space-y-2">
                <span className="badge badge-green w-full justify-center py-2">Confirmed ✓</span>
                <p className="text-xs text-center font-mono text-gray-600">{a.admissionNumber}</p>
              </div>
            ) : (
              <>
                {!a.seatAllocated && <p className="text-xs text-amber-600 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Seat allocation required</p>}
                {a.feeStatus !== 'paid' && <p className="text-xs text-amber-600 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Fee payment required</p>}
                <button
                  onClick={() => doAction('confirm', `/applicants/${id}/confirm`)}
                  disabled={!canConfirm || !!actionLoading}
                  className={`w-full ${canConfirm ? 'btn-success' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                >
                  {actionLoading === 'confirm' ? 'Confirming…' : 'Confirm Admission'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-1">Requires: seat allocated + fee paid</p>
              </>
            )}
          </div>

          {/* Reject */}
          {!isConfirmed && !isRejected && (
            <button
              onClick={() => {
                if (confirm('Reject this applicant? This will release any allocated seat.')) {
                  doAction('reject', `/applicants/${id}/reject`, 'put');
                }
              }}
              disabled={!!actionLoading}
              className="btn-danger w-full"
            >
              Reject Applicant
            </button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="text-xs text-gray-400 text-right">
        Created by {a.createdBy?.name || 'System'} · {new Date(a.createdAt).toLocaleString()}
      </div>
    </div>
  );
}
