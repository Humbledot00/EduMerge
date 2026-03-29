import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const EMPTY = { institution: '', name: '', code: '', address: '' };

export default function Campuses() {
  const [items, setItems] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [filterInst, setFilterInst] = useState('');

  useEffect(() => {
    api.get('/institutions').then(r => setInstitutions(r.data)).catch(() => {});
    fetch();
  }, []);

  const fetch = async (instId = '') => {
    try {
      const url = instId ? `/campuses?institution=${instId}` : '/campuses';
      const { data } = await api.get(url);
      setItems(data);
    } catch { toast.error('Failed to load campuses'); }
  };

  const handleFilter = (val) => { setFilterInst(val); fetch(val); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editItem) {
        await api.put(`/campuses/${editItem._id}`, form);
        toast.success('Campus updated');
      } else {
        await api.post('/campuses', form);
        toast.success('Campus created');
      }
      fetch(filterInst);
      close();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campus?')) return;
    try { await api.delete(`/campuses/${id}`); toast.success('Deleted'); fetch(filterInst); }
    catch { toast.error('Failed to delete'); }
  };

  const open = (item = null) => {
    setEditItem(item);
    setForm(item
      ? { institution: item.institution._id, name: item.name, code: item.code, address: item.address || '' }
      : EMPTY);
    setShowModal(true);
  };
  const close = () => { setShowModal(false); setEditItem(null); setForm(EMPTY); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campuses</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage campuses under each institution</p>
        </div>
        <button onClick={() => open()} className="btn-primary"><Plus size={16} /> Add Campus</button>
      </div>

      <div className="mb-4">
        <select className="form-select max-w-xs" value={filterInst} onChange={e => handleFilter(e.target.value)}>
          <option value="">All Institutions</option>
          {institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-th">Campus Name</th>
              <th className="table-th">Code</th>
              <th className="table-th hidden md:table-cell">Institution</th>
              <th className="table-th hidden md:table-cell">Address</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={5} className="table-td text-center text-gray-400 py-10">No campuses found.</td></tr>
            )}
            {items.map(item => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{item.name}</td>
                <td className="table-td"><span className="badge badge-blue">{item.code}</span></td>
                <td className="table-td hidden md:table-cell text-gray-500">{item.institution?.name}</td>
                <td className="table-td hidden md:table-cell text-gray-500">{item.address || '—'}</td>
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

      <Modal show={showModal} onClose={close} title={editItem ? 'Edit Campus' : 'Add Campus'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Institution *</label>
            <select className="form-select" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} required>
              <option value="">Select institution</option>
              {institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Campus Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Main Campus" />
          </div>
          <div>
            <label className="form-label">Code *</label>
            <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required placeholder="e.g. MAIN" />
          </div>
          <div>
            <label className="form-label">Address</label>
            <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Campus address" />
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
