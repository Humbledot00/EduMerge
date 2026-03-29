import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const EMPTY = {
  firstName: '', lastName: '', dob: '', gender: '',
  email: '', phone: '', address: '',
  category: '', entryType: 'Regular', quotaType: '',
  program: '', qualifyingExam: '', marks: '', allotmentNumber: '',
  academicYear: '2026'
};

export default function ApplicantForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(() => toast.error('Could not load programs'));
    if (isEdit) {
      api.get(`/applicants/${id}`)
        .then(r => {
          const a = r.data;
          setForm({
            firstName: a.firstName, lastName: a.lastName,
            dob: a.dob ? a.dob.substring(0, 10) : '',
            gender: a.gender, email: a.email, phone: a.phone, address: a.address,
            category: a.category, entryType: a.entryType, quotaType: a.quotaType,
            program: a.program?._id || '', qualifyingExam: a.qualifyingExam || '',
            marks: a.marks ?? '', allotmentNumber: a.allotmentNumber || '',
            academicYear: a.academicYear
          });
        })
        .catch(() => toast.error('Failed to load applicant'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, marks: form.marks !== '' ? Number(form.marks) : undefined };
      if (isEdit) {
        await api.put(`/applicants/${id}`, payload);
        toast.success('Applicant updated');
        navigate(`/applicants/${id}`);
      } else {
        const { data } = await api.post('/applicants', payload);
        toast.success('Applicant created');
        navigate(`/applicants/${data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  if (fetching) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  }

  const isGovt = form.quotaType === 'KCET' || form.quotaType === 'COMEDK';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary btn-sm"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Applicant' : 'New Applicant'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Application form — maximum 15 fields</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Personal Details */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1 */}
            <div>
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} required placeholder="Rajesh" />
            </div>
            {/* 2 */}
            <div>
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} required placeholder="Kumar" />
            </div>
            {/* 3 */}
            <div>
              <label className="form-label">Date of Birth *</label>
              <input type="date" className="form-input" value={form.dob} onChange={e => set('dob', e.target.value)} required />
            </div>
            {/* 4 */}
            <div>
              <label className="form-label">Gender *</label>
              <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)} required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* 5 */}
            <div>
              <label className="form-label">Email *</label>
              <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="rajesh@example.com" />
            </div>
            {/* 6 */}
            <div>
              <label className="form-label">Phone *</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+91 9876543210" />
            </div>
            {/* 7 */}
            <div className="sm:col-span-2">
              <label className="form-label">Address *</label>
              <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} required placeholder="Full address" />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Academic & Admission Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 8 */}
            <div>
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {['GM', 'SC', 'ST', 'OBC', '2A', '2B', '3A', '3B'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* 9 */}
            <div>
              <label className="form-label">Entry Type *</label>
              <select className="form-select" value={form.entryType} onChange={e => set('entryType', e.target.value)} required>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            {/* 10 */}
            <div>
              <label className="form-label">Quota Type *</label>
              <select className="form-select" value={form.quotaType} onChange={e => set('quotaType', e.target.value)} required>
                <option value="">Select quota</option>
                <option value="KCET">KCET (Government)</option>
                <option value="COMEDK">COMEDK (Government)</option>
                <option value="Management">Management</option>
              </select>
            </div>
            {/* 11 */}
            <div>
              <label className="form-label">Program *</label>
              <select className="form-select" value={form.program} onChange={e => set('program', e.target.value)} required>
                <option value="">Select program</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.courseType}) — {p.department?.name}
                  </option>
                ))}
              </select>
            </div>
            {/* 12 */}
            <div>
              <label className="form-label">Qualifying Exam</label>
              <input className="form-input" value={form.qualifyingExam} onChange={e => set('qualifyingExam', e.target.value)} placeholder="10+2 / Diploma / B.Sc." />
            </div>
            {/* 13 */}
            <div>
              <label className="form-label">Marks / Percentage</label>
              <input type="number" min="0" max="100" step="0.01" className="form-input" value={form.marks} onChange={e => set('marks', e.target.value)} placeholder="85.5" />
            </div>
            {/* 14 — Allotment number for govt flows */}
            {isGovt && (
              <div>
                <label className="form-label">Allotment Number <span className="text-xs text-gray-400">({form.quotaType})</span></label>
                <input className="form-input" value={form.allotmentNumber} onChange={e => set('allotmentNumber', e.target.value)} placeholder="e.g. KCET-2026-001234" />
              </div>
            )}
            {/* 15 */}
            <div>
              <label className="form-label">Academic Year *</label>
              <input className="form-input" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} required placeholder="2026" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving…' : isEdit ? 'Update Applicant' : 'Create Applicant'}
          </button>
        </div>
      </form>
    </div>
  );
}
