import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, GraduationCap, FileWarning, CreditCard, TrendingUp,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
  </div>
);

const QuotaBadge = ({ quota, data, colorClass }) => (
  <div className="flex-1 min-w-0">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-semibold text-gray-600">{quota}</span>
      <span className="text-xs text-gray-500">{data.allocated}/{data.total}</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all ${colorClass}`}
        style={{ width: data.total > 0 ? `${Math.round(data.allocated / data.total * 100)}%` : '0%' }}
      />
    </div>
    <p className="text-xs text-gray-400 mt-0.5">{data.remaining} remaining</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const s = data?.summary || {};

  const statusMap = {};
  (data?.statusBreakdown || []).forEach(b => { statusMap[b._id] = b.count; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-0.5">Overview of admission activity</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applicants"    value={s.totalApplicants}    icon={Users}        color="bg-indigo-500" />
        <StatCard label="Confirmed Admissions" value={s.confirmedAdmissions} icon={GraduationCap} color="bg-green-500" />
        <StatCard label="Pending Documents"   value={s.pendingDocs}        icon={FileWarning}  color="bg-yellow-500" sub="Seats allocated" />
        <StatCard label="Pending Fees"        value={s.pendingFees}        icon={CreditCard}   color="bg-red-500"    sub="Seats allocated" />
      </div>

      {/* Application status breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'pending',            label: 'Pending',         cls: 'badge-gray'   },
          { key: 'seat_allocated',     label: 'Seat Allocated',  cls: 'badge-blue'   },
          { key: 'documents_verified', label: 'Docs Verified',   cls: 'badge-purple' },
          { key: 'fee_paid',           label: 'Fee Paid',        cls: 'badge-yellow' },
          { key: 'confirmed',          label: 'Confirmed',       cls: 'badge-green'  },
          { key: 'rejected',           label: 'Rejected',        cls: 'badge-red'    }
        ].map(({ key, label, cls }) => (
          <div key={key} className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{statusMap[key] || 0}</p>
            <span className={`${cls} mt-2`}>{label}</span>
          </div>
        ))}
      </div>

      {/* Per-program seat matrix */}
      {data?.programStats?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Program-wise Seat Status</h2>
            {(user?.role === 'admin' || user?.role === 'admission_officer') && (
              <Link to="/applicants" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View Applicants →
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {data.programStats.map(ps => {
              const fillPct = ps.totalIntake > 0
                ? Math.round(ps.totalAllocated / ps.totalIntake * 100) : 0;
              return (
                <div key={ps._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{ps.program.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ps.department} · {ps.campus} · {ps.institution} · {ps.program.courseType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{ps.totalAllocated}/{ps.totalIntake}</p>
                      <p className="text-xs text-gray-500">{fillPct}% filled</p>
                    </div>
                  </div>

                  {/* Overall progress */}
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-3 rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>

                  {/* Quota breakdown */}
                  <div className="flex gap-4">
                    <QuotaBadge quota="KCET"       data={ps.quotas.KCET}       colorClass="bg-blue-500" />
                    <QuotaBadge quota="COMEDK"     data={ps.quotas.COMEDK}     colorClass="bg-purple-500" />
                    <QuotaBadge quota="Management" data={ps.quotas.Management} colorClass="bg-indigo-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.programStats?.length === 0 && (
        <div className="card p-10 text-center text-gray-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No seat matrix configured yet</p>
          {user?.role === 'admin' && (
            <Link to="/seat-matrix" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
              Configure Seat Matrix →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
