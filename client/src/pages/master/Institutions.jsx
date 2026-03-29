import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';

const EMPTY = { name: '', code: '', address: '', city: '', state: '' };

export default function Institutions() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try {
      const { data } = await api.get('/institutions');
      setItems(data);
    } catch { toast.error('Failed to load institutions'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editItem) {
        await api.put(`/institutions/${editItem._id}`, form);
        toast.success('Institution updated');
      } else {
        await api.post('/institutions', form);
        toast.success('Institution created');
      }
      fetch();
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this institution? This cannot be undone.')) return;
    try {
      await api.delete(`/institutions/${id}`);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Failed to delete'); }
  };

  const open = (item = null) => {
    setEditItem(item);
    setForm(item ? { name: item.name, code: item.code, address: item.address || '', city: item.city || '', state: item.state || '' } : EMPTY);
    setShowModal(true);
  };

  const close = () => { setShowModal(false); setEditItem(null); setForm(EMPTY); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage college institutions</p>
        </div>
        <button onClick={() => open()} className="btn-primary">
          <Plus size={16} /> Add Institution
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Name</th>
              <th className="table-th">Code</th>
              <th className="table-th hidden md:table-cell">City</th>
              <th className="table-th hidden md:table-cell">State</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="table-td text-center text-gray-400 py-10">No institutions found. Add one to get started.</td></tr>
            )}
            {items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-indigo-500 flex-shrink-0" />
                    {item.name}
                  </div>
                </td>
                <td className="table-td"><span className="badge badge-blue">{item.code}</span></td>
                <td className="table-td hidden md:table-cell">{item.city || '—'}</td>
                <td className="table-td hidden md:table-cell">{item.state || '—'}</td>
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

      <Modal show={showModal} onClose={close} title={editItem ? 'Edit Institution' : 'Add Institution'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Institution Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Sample Valley College of Engineering" />
          </div>
          <div>
            <label className="form-label">Code * <span className="text-xs text-gray-400">(used in admission number)</span></label>
            <input className="form-input uppercase" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required placeholder="e.g. SVCE" maxLength={10} />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street address" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">City</label>
              <input className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Bengaluru" />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="form-input" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="Karnataka" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
