import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Grid3X3 } from 'lucide-react';

const EMPTY_QUOTAS = { KCET: '0', COMEDK: '0', Management: '0' };

export default function SeatMatrix() {
  const [matrices, setMatrices] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ program: '', academicYear: '2026', quotas: EMPTY_QUOTAS, supernumerary: '0' });
  const [loading, setLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(() => {});
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      const { data } = await api.get('/seat-matrix');
      setMatrices(data);
    } catch { toast.error('Failed to load seat matrix'); }
  };

  const quotaTotal = () =>
    (parseInt(form.quotas.KCET) || 0) + (parseInt(form.quotas.COMEDK) || 0) + (parseInt(form.quotas.Management) || 0);

  const handleProgramChange = (progId) => {
    const prog = programs.find(p => p._id === progId);
    setSelectedProgram(prog || null);
    setForm(f => ({ ...f, program: progId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram && !editItem) {
      toast.error('Select a program first');
      return;
    }
    const intake = editItem?.program?.totalIntake ?? selectedProgram?.totalIntake;
    if (quotaTotal() !== intake) {
      toast.error(`Quota total (${quotaTotal()}) must equal program intake (${intake})`);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        program: form.program,
        academicYear: form.academicYear,
        quotas: {
          KCET: { total: parseInt(form.quotas.KCET) || 0 },
          COMEDK: { total: parseInt(form.quotas.COMEDK) || 0 },
          Management: { total: parseInt(form.quotas.Management) || 0 }
        },
        supernumerary: { total: parseInt(form.supernumerary) || 0 }
      };
      if (editItem) {
        await api.put(`/seat-matrix/${editItem._id}`, payload);
        toast.success('Seat matrix updated');
      } else {
        await api.post('/seat-matrix', payload);
        toast.success('Seat matrix created');
      }
      fetchMatrices();
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const open = (item = null) => {
    setEditItem(item);
    if (item) {
      setSelectedProgram(item.program);
      setForm({
        program: item.program._id,
        academicYear: item.academicYear,
        quotas: {
          KCET: String(item.quotas.KCET.total),
          COMEDK: String(item.quotas.COMEDK.total),
          Management: String(item.quotas.Management.total)
        },
        supernumerary: String(item.supernumerary?.total || 0)
      });
    } else {
      setSelectedProgram(null);
      setForm({ program: '', academicYear: '2026', quotas: EMPTY_QUOTAS, supernumerary: '0' });
    }
    setShowModal(true);
  };
  const close = () => { setShowModal(false); setEditItem(null); setSelectedProgram(null); };

  const setQ = (k, v) => setForm(f => ({ ...f, quotas: { ...f.quotas, [k]: v } }));

  const configuredIds = new Set(matrices.map(m => m.program._id));
  const unconfiguredPrograms = programs.filter(p => !configuredIds.has(p._id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seat Matrix</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure quota-wise seat allocation per program</p>
        </div>
        <button onClick={() => open()} className="btn-primary" disabled={unconfiguredPrograms.length === 0}>
          <Plus size={16} /> Configure Program
        </button>
      </div>

      {unconfiguredPrograms.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          {unconfiguredPrograms.length} program(s) have not been configured yet.
        </div>
      )}

      <div className="space-y-4">
        {matrices.length === 0 && (
          <div className="card p-10 text-center text-gray-400">
            <Grid3X3 size={40} className="mx-auto mb-3 opacity-40" />
            <p>No seat matrix configured yet.</p>
          </div>
        )}
        {matrices.map(m => {
          const totalAllocated = m.quotas.KCET.allocated + m.quotas.COMEDK.allocated + m.quotas.Management.allocated;
          const intake = m.program.totalIntake;
          return (
            <div key={m._id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{m.program.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {m.program.courseType} · {m.program.department?.name} · Year {m.academicYear}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{totalAllocated}/{intake}</p>
                    <p className="text-xs text-gray-400">Allocated / Intake</p>
                  </div>
                  <button onClick={() => open(m)} className="btn-secondary btn-sm"><Pencil size={14} /> Edit</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['KCET', 'COMEDK', 'Management'].map(q => {
                  const qd = m.quotas[q];
                  const pct = qd.total > 0 ? Math.round(qd.allocated / qd.total * 100) : 0;
                  const isFull = qd.allocated >= qd.total;
                  return (
                    <div key={q} className={`p-3 rounded-lg border ${isFull ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm text-gray-700">{q}</span>
                        {isFull && <span className="badge badge-red text-xs">FULL</span>}
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Total</span>
                        <span className="font-medium">{qd.total}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Allocated</span>
                        <span className="font-medium text-indigo-600">{qd.allocated}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Remaining</span>
                        <span className={`font-bold ${isFull ? 'text-red-600' : 'text-green-600'}`}>{qd.total - qd.allocated}</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {(m.supernumerary?.total > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                  <span>Supernumerary Seats</span>
                  <span className="font-medium">{m.supernumerary.allocated}/{m.supernumerary.total}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal show={showModal} onClose={close} title={editItem ? 'Edit Seat Matrix' : 'Configure Seat Matrix'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editItem && (
            <div>
              <label className="form-label">Program *</label>
              <select className="form-select" value={form.program} onChange={e => handleProgramChange(e.target.value)} required>
                <option value="">Select program</option>
                {unconfiguredPrograms.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.courseType}) — Intake: {p.totalIntake}</option>
                ))}
              </select>
            </div>
          )}

          {editItem && (
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium text-gray-700">{editItem.program.name}</p>
              <p className="text-gray-500">Total Intake: {editItem.program.totalIntake}</p>
            </div>
          )}

          <div>
            <label className="form-label">Academic Year *</label>
            <input className="form-input" value={form.academicYear} onChange={e => setForm(f => ({ ...f, academicYear: e.target.value }))} required placeholder="2026" />
          </div>

          <div>
            <label className="form-label">
              Quota Distribution *
              {selectedProgram || editItem ? (
                <span className={`ml-2 text-xs ${quotaTotal() === (editItem?.program?.totalIntake ?? selectedProgram?.totalIntake) ? 'text-green-600' : 'text-red-600'}`}>
                  Total: {quotaTotal()} / {editItem?.program?.totalIntake ?? selectedProgram?.totalIntake}
                </span>
              ) : null}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['KCET', 'COMEDK', 'Management'].map(q => (
                <div key={q}>
                  <label className="text-xs text-gray-500 mb-1 block">{q}</label>
                  <input
                    type="number" min="0"
                    className="form-input"
                    value={form.quotas[q]}
                    onChange={e => setQ(q, e.target.value)}
                  />
                  {editItem && <p className="text-xs text-gray-400 mt-0.5">Allocated: {editItem.quotas[q].allocated}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Supernumerary Seats <span className="text-xs text-gray-400">(optional, separate from intake)</span></label>
            <input type="number" min="0" className="form-input" value={form.supernumerary} onChange={e => setForm(f => ({ ...f, supernumerary: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : editItem ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
