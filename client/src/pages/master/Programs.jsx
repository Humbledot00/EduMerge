import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { department: '', name: '', code: '', courseType: 'UG', entryType: 'Regular', admissionMode: 'Both', academicYear: '2026', totalIntake: '' };

export default function Programs() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get('/programs');
      setItems(data);
    } catch { toast.error('Failed to load programs'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editItem) {
        await api.put(`/programs/${editItem._id}`, form);
        toast.success('Program updated');
      } else {
        await api.post('/programs', form);
        toast.success('Program created');
      }
      fetchPrograms();
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this program?')) return;
    try { await api.delete(`/programs/${id}`); toast.success('Deleted'); fetchPrograms(); }
    catch { toast.error('Failed to delete'); }
  };

  const open = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      department: item.department._id, name: item.name, code: item.code,
      courseType: item.courseType, entryType: item.entryType, admissionMode: item.admissionMode,
      academicYear: item.academicYear, totalIntake: item.totalIntake
    } : EMPTY);
    setShowModal(true);
  };
  const close = () => { setShowModal(false); setEditItem(null); setForm(EMPTY); };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage programs / branches</p>
        </div>
        <button onClick={() => open()} className="btn-primary"><Plus size={16} /> Add Program</button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Program</th>
              <th className="table-th">Code</th>
              <th className="table-th">Type</th>
              <th className="table-th hidden md:table-cell">Intake</th>
              <th className="table-th hidden lg:table-cell">Year</th>
              <th className="table-th hidden lg:table-cell">Department</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={7} className="table-td text-center text-gray-400 py-10">No programs found.</td></tr>
            )}
            {items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{item.name}</td>
                <td className="table-td"><span className="badge badge-blue">{item.code}</span></td>
                <td className="table-td">
                  <div className="flex gap-1 flex-wrap">
                    <span className="badge badge-purple">{item.courseType}</span>
                    <span className="badge badge-gray">{item.entryType}</span>
                  </div>
                </td>
                <td className="table-td hidden md:table-cell font-semibold">{item.totalIntake}</td>
                <td className="table-td hidden lg:table-cell">{item.academicYear}</td>
                <td className="table-td hidden lg:table-cell text-gray-500 text-xs">{item.department?.name}</td>
                <td className="table-td text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => open(item)} className="btn-secondary btn-sm"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(item._id)} className="btn-danger btn-sm"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={close} title={editItem ? 'Edit Program' : 'Add Program'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Department *</label>
            <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)} required>
              <option value="">Select department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name} — {d.campus?.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Program Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. B.E. Computer Science" />
            </div>
            <div>
              <label className="form-label">Code * <span className="text-xs text-gray-400">(admission #)</span></label>
              <input className="form-input uppercase" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} required placeholder="e.g. CSE" maxLength={8} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Course Type *</label>
              <select className="form-select" value={form.courseType} onChange={e => set('courseType', e.target.value)} required>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
              </select>
            </div>
            <div>
              <label className="form-label">Entry Type</label>
              <select className="form-select" value={form.entryType} onChange={e => set('entryType', e.target.value)}>
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            <div>
              <label className="form-label">Admission Mode</label>
              <select className="form-select" value={form.admissionMode} onChange={e => set('admissionMode', e.target.value)}>
                <option value="Both">Both</option>
                <option value="Government">Government</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Academic Year *</label>
              <input className="form-input" value={form.academicYear} onChange={e => set('academicYear', e.target.value)} required placeholder="2026" />
            </div>
            <div>
              <label className="form-label">Total Intake *</label>
              <input className="form-input" type="number" min="1" value={form.totalIntake} onChange={e => set('totalIntake', e.target.value)} required placeholder="60" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving…' : editItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
