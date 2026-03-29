import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { campus: '', name: '', code: '' };

export default function Departments() {
  const [items, setItems] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [filterCampus, setFilterCampus] = useState('');

  useEffect(() => {
    api.get('/campuses').then(r => setCampuses(r.data)).catch(() => {});
    fetchDepts();
  }, []);

  const fetchDepts = async (campusId = '') => {
    try {
      const url = campusId ? `/departments?campus=${campusId}` : '/departments';
      const { data } = await api.get(url);
      setItems(data);
    } catch { toast.error('Failed to load departments'); }
  };

  const handleFilter = (val) => { setFilterCampus(val); fetchDepts(val); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editItem) {
        await api.put(`/departments/${editItem._id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      fetchDepts(filterCampus);
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await api.delete(`/departments/${id}`); toast.success('Deleted'); fetchDepts(filterCampus); }
    catch { toast.error('Failed to delete'); }
  };

  const open = (item = null) => {
    setEditItem(item);
    setForm(item ? { campus: item.campus._id, name: item.name, code: item.code } : EMPTY);
    setShowModal(true);
  };
  const close = () => { setShowModal(false); setEditItem(null); setForm(EMPTY); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage departments under each campus</p>
        </div>
        <button onClick={() => open()} className="btn-primary"><Plus size={16} /> Add Department</button>
      </div>

      <div className="mb-4">
        <select className="form-select max-w-xs" value={filterCampus} onChange={e => handleFilter(e.target.value)}>
          <option value="">All Campuses</option>
          {campuses.map(c => <option key={c._id} value={c._id}>{c.name} — {c.institution?.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Department</th>
              <th className="table-th">Code</th>
              <th className="table-th hidden md:table-cell">Campus</th>
              <th className="table-th hidden md:table-cell">Institution</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="table-td text-center text-gray-400 py-10">No departments found.</td></tr>
            )}
            {items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{item.name}</td>
                <td className="table-td"><span className="badge badge-purple">{item.code}</span></td>
                <td className="table-td hidden md:table-cell text-gray-500">{item.campus?.name}</td>
                <td className="table-td hidden md:table-cell text-gray-500">{item.campus?.institution?.name}</td>
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

      <Modal show={showModal} onClose={close} title={editItem ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Campus *</label>
            <select className="form-select" value={form.campus} onChange={e => setForm(p => ({ ...p, campus: e.target.value }))} required>
              <option value="">Select campus</option>
              {campuses.map(c => <option key={c._id} value={c._id}>{c.name} — {c.institution?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Department Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Computer Science & Engineering" />
          </div>
          <div>
            <label className="form-label">Code *</label>
            <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required placeholder="e.g. CSE" />
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
