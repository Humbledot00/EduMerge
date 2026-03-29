import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { GraduationCap, Search, Download } from 'lucide-react';

export default function AdmissionList() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ quotaType: '', program: '' });
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(() => {});
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async (params = {}) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ status: 'confirmed' });
      if (params.search)    q.set('search', params.search);
      if (params.quotaType) q.set('quotaType', params.quotaType);
      if (params.program)   q.set('program', params.program);
      const { data } = await api.get(`/applicants?${q}`);
      setAdmissions(data);
    } catch { toast.error('Failed to load admissions'); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmissions({ search, ...filters });
  };

  const handleFilter = (key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    fetchAdmissions({ search, ...f });
  };

  const clearFilters = () => {
    setSearch(''); setFilters({ quotaType: '', program: '' });
    fetchAdmissions();
  };

  const QUOTA_COLOR = { KCET: 'badge-blue', COMEDK: 'badge-purple', Management: 'badge-indigo bg-indigo-100 text-indigo-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Confirmed Admissions</h1>
          <p className="text-gray-500 text-sm mt-0.5">{admissions.length} admission{admissions.length !== 1 ? 's' : ''} confirmed</p>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap size={24} className="text-green-600" />
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="form-input pl-9"
              placeholder="Search name, admission number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select w-36" value={filters.quotaType} onChange={e => handleFilter('quotaType', e.target.value)}>
            <option value="">All Quotas</option>
            <option value="KCET">KCET</option>
            <option value="COMEDK">COMEDK</option>
            <option value="Management">Management</option>
          </select>
          <select className="form-select w-48" value={filters.program} onChange={e => handleFilter('program', e.target.value)}>
            <option value="">All Programs</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button type="submit" className="btn-primary"><Search size={16} /> Search</button>
          <button type="button" onClick={clearFilters} className="btn-secondary">Clear</button>
        </form>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {['KCET', 'COMEDK', 'Management'].map(q => {
          const count = admissions.filter(a => a.quotaType === q).length;
          return (
            <div key={q} className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <span className={`badge mt-1 ${QUOTA_COLOR[q]}`}>{q}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Admission Number</th>
              <th className="table-th">Student Name</th>
              <th className="table-th hidden md:table-cell">Program</th>
              <th className="table-th">Quota</th>
              <th className="table-th hidden lg:table-cell">Category</th>
              <th className="table-th hidden lg:table-cell">Year</th>
              <th className="table-th hidden xl:table-cell">Confirmed On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={7} className="table-td text-center py-10">
                <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></div>
              </td></tr>
            )}
            {!loading && admissions.length === 0 && (
              <tr><td colSpan={7} className="table-td text-center text-gray-400 py-12">
                <GraduationCap size={32} className="mx-auto mb-2 opacity-40" />
                No confirmed admissions yet.
              </td></tr>
            )}
            {!loading && admissions.map(a => (
              <tr key={a._id} className="hover:bg-gray-50">
                <td className="table-td">
                  <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                    {a.admissionNumber}
                  </span>
                </td>
                <td className="table-td">
                  <p className="font-medium text-gray-900">{a.firstName} {a.lastName}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </td>
                <td className="table-td hidden md:table-cell">
                  <p className="text-sm">{a.program?.name}</p>
                  <p className="text-xs text-gray-400">{a.program?.code}</p>
                </td>
                <td className="table-td">
                  <span className={`badge ${QUOTA_COLOR[a.quotaType]}`}>{a.quotaType}</span>
                </td>
                <td className="table-td hidden lg:table-cell">
                  <span className="badge badge-gray">{a.category}</span>
                </td>
                <td className="table-td hidden lg:table-cell">{a.academicYear}</td>
                <td className="table-td hidden xl:table-cell text-gray-400 text-xs">
                  {new Date(a.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
