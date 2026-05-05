import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function BorrowForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    item_code: '',
    quantity: 1,
    borrow_date: new Date().toISOString().split('T')[0],
    return_date_plan: '',
    purpose: '',
  });
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/items', { params: { per_page: 100, condition: 'good' } })
      .then(res => setItems(res.data.data.filter(b => b.available_quantity > 0)));
  }, []);

  const selectedItem = items.find(b => b.item_code === form.item_code) || null;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/borrows', form);
      navigate('/borrows');
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else alert(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/borrows')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-2xl font-bold text-gray-900">Request Borrow</div>
          <div className="text-gray-500 text-sm">Fill out the equipment borrow request form</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Pilih Barang */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item <span className="text-red-500">*</span></label>
          <select name="item_code" value={form.item_code} onChange={handleChange} required
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.item_code ? 'border-red-400' : 'border-gray-300'}`}>
            <option value="">-- Select an Item --</option>
            {items.map(b => (
              <option key={b.id} value={b.item_code}>
                {b.item_name} ({b.category}) - Available: {b.available_quantity}
              </option>
            ))}
          </select>
          {errors.item_code && <p className="text-red-500 text-xs mt-1">{errors.item_code[0]}</p>}
        </div>

        {/* Info barang terpilih */}
        {selectedItem && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-800">{selectedItem.item_name} ({selectedItem.item_code})</p>
            <p className="text-blue-600">Stock available: {selectedItem.available_quantity} unit(s) • Location: {selectedItem.location || '-'}</p>
          </div>
        )}

        {/* Jumlah */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
          <input type="number" name="quantity" min="1" max={selectedItem?.available_quantity || 999}
            value={form.quantity} onChange={handleChange} required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        {/* Tanggal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrow Date <span className="text-red-500">*</span></label>
            <input type="date" name="borrow_date" value={form.borrow_date} onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Return <span className="text-red-500">*</span></label>
            <input type="date" name="return_date_plan" value={form.return_date_plan} onChange={handleChange} required
              min={form.borrow_date}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${errors.return_date_plan ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.return_date_plan && <p className="text-red-500 text-xs mt-1">{errors.return_date_plan[0]}</p>}
          </div>
        </div>

        {/* Keperluan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose <span className="text-red-500">*</span></label>
          <textarea name="purpose" value={form.purpose} onChange={handleChange} required rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Explain the purpose of borrowing..." />
          {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose[0]}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/borrows')}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}