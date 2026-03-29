import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Filter } from 'lucide-react';

const STATUS_BADGE = {
  pending:            'badge-gray',
  seat_allocated:     'badge-blue',
  documents_verified: 'badge-purple',
  fee_paid:           'badge-yellow',
  confirmed:          'badge-green',
  rejected:           'badge-red'
};

const STATUS_LABEL = {
  pending:            'Pending',
  seat_allocated:     'Seat Allocated',
  documents_verified: 'Docs Verified',
  fee_paid:           'Fee Paid',
  confirmed:          'Confirmed',
  rejected:           'Rejected'
};

const DOC_BADGE  = { pending: 'badge-yellow', submitted: 'badge-blue', verified: 'badge-green' };
const FEE_BADGE  = { pending: 'badge-yellow', paid: 'badge-green' };

export default function ApplicantList() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', quotaType: '', feeStatus: '' });
  const [programs, setPrograms] = useState([]);
  const [programFilter, setProgramFilter] = useState('');

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(() => {});
    fetchApplicants();
  }, []);

  const fetchApplicants = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.search)      query.set('search', params.search);
      if (params.status)      query.set('status', params.status);
      if (params.quotaType)   query.set('quotaType', params.quotaType);
      if (params.feeStatus)   query.set('feeStatus', params.feeStatus);
      if (params.program)     query.set('program', params.program);
      const { data } = await api.get(`/applicants?${query}`);
      setApplicants(data);
    } catch { toast.error('Failed to load applicants'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchApplicants({ search, ...filters, program: programFilter });
  };

  const handleFilterChange = (key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    fetchApplicants({ search, ...f, program: programFilter });
  };

  const handleProgramFilter = (val) => {
    setProgramFilter(val);
    fetchApplicants({ search, ...filters, program: val });
  };

  const clearFilters = () => {
    setSearch(''); setFilters({ status: '', quotaType: '', feeStatus: '' }); setProgramFilter('');
    fetchApplicants();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-500 text-sm mt-0.5">{applicants.length} applicant{applicants.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/applicants/new" className="btn-primary"><Plus size={16} /> New Applicant</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="form-input pl-9"
              placeholder="Search name, email, allotment #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select w-36" value={filters.status} onChange={e => handleFilterChange('status', e.target.value)}>
            <option value="">All Status</option>
            {Object.keys(STATUS_LABEL).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select className="form-select w-36" value={filters.quotaType} onChange={e => handleFilterChange('quotaType', e.target.value)}>
            <option value="">All Quotas</option>
            <option value="KCET">KCET</option>
            <option value="COMEDK">COMEDK</option>
            <option value="Management">Management</option>
          </select>
          <select className="form-select w-36" value={filters.feeStatus} onChange={e => handleFilterChange('feeStatus', e.target.value)}>
            <option value="">All Fees</option>
            <option value="pending">Fee Pending</option>
            <option value="paid">Fee Paid</option>
          </select>
          <select className="form-select w-48" value={programFilter} onChange={e => handleProgramFilter(e.target.value)}>
            <option value="">All Programs</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button type="submit" className="btn-primary"><Search size={16} /> Search</button>
          <button type="button" onClick={clearFilters} className="btn-secondary">Clear</button>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Applicant</th>
              <th className="table-th hidden md:table-cell">Program</th>
              <th className="table-th">Quota</th>
              <th className="table-th hidden lg:table-cell">Docs</th>
              <th className="table-th hidden lg:table-cell">Fee</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={7} className="table-td text-center py-10">
                <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></div>
              </td></tr>
            )}
            {!loading && applicants.length === 0 && (
              <tr><td colSpan={7} className="table-td text-center text-gray-400 py-10">No applicants found.</td></tr>
            )}
            {!loading && applicants.map(a => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="table-td">
                  <p className="font-medium text-gray-900">{a.firstName} {a.lastName}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </td>
                <td className="table-td hidden md:table-cell">
                  <p className="text-sm">{a.program?.name}</p>
                  <p className="text-xs text-gray-400">{a.program?.courseType} · {a.academicYear}</p>
                </td>
                <td className="table-td">
                  <span className="badge badge-indigo bg-indigo-100 text-indigo-700">{a.quotaType}</span>
                </td>
                <td className="table-td hidden lg:table-cell">
                  <span className={DOC_BADGE[a.documentStatus]}>{a.documentStatus}</span>
                </td>
                <td className="table-td hidden lg:table-cell">
                  <span className={FEE_BADGE[a.feeStatus]}>{a.feeStatus}</span>
                </td>
                <td className="table-td">
                  <span className={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</span>
                </td>
                <td className="table-td text-right">
                  <Link to={`/applicants/${a._id}`} className="btn-secondary btn-sm">
                    <Eye size={14} /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
