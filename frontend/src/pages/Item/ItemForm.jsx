import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const Field = ({ name, label, type = 'text', required, value, onChange, error, children, accept }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input 
        type={type} 
        name={name} 
        value={type !== 'file' ? (value || '') : undefined} 
        onChange={onChange} 
        required={required}
        accept={accept}
        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? 'border-red-400' : 'border-gray-300'
        } ${type === 'file' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100' : ''}`} 
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
  </div>
);

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageItems } = useAuth(); 
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    item_name: '', 
    category: '', 
    description: '',
    total_quantity: '', 
    condition: 'good', 
    location: '',
    purchase_price: '', 
    purchase_date: '',
    photo: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!canManageItems()) { 
      navigate('/items'); 
      return; 
    }
    
    if (isEdit) {
      api.get(`/items/${id}`)
        .then(res => {
          const item = res.data;
          setForm({
            item_name: item.item_name || '',
            category: item.category || '',
            description: item.description || '',
            total_quantity: item.total_quantity || '',
            condition: item.condition || 'good',
            location: item.location || '',
            purchase_price: item.purchase_price || '',
            purchase_date: item.purchase_date || '',
            photo: null,
          });
        })
        .finally(() => setFetchLoading(false));
    }
  }, [id, canManageItems, isEdit, navigate]); 

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    
    // Penanganan khusus untuk input file
    if (type === 'file') {
      setForm(p => ({ ...p, [name]: files[0] || null }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
    
    setErrors(p => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const submitData = new FormData();
      
      Object.keys(form).forEach(key => {
        // Jangan masukkan photo jika kosong/bukan file baru
        if (key === 'photo' && !(form[key] instanceof File)) return;
        
        // Masukkan data ke FormData
        if (form[key] !== null && form[key] !== undefined) {
          submitData.append(key, form[key]);
        }
      });

      if (isEdit) {
        submitData.append('_method', 'PUT');
        await api.post(`/items/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/items', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/items');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/items')} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Item' : 'Add Item'}</div>
          <div className="text-gray-500 text-sm">{isEdit ? 'Update item details' : 'Register a new item'}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field name="item_name" label="Item Name" required value={form.item_name} onChange={handleChange} error={errors.item_name} />
          
          <Field name="category" label="Category" required error={errors.category}>
            <input list="category-list" name="category" value={form.category}
              onChange={handleChange} required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Select or type category" />
            <datalist id="category-list">
              {['Computer', 'Laptop', 'Projector', 'Printer', 'Monitor', 'Desk', 'Chair', 'Phone', 'Other'].map(k => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </Field>
          
          <Field name="total_quantity" label="Total Quantity" type="number" required value={form.total_quantity} onChange={handleChange} error={errors.total_quantity} />
          
          <Field name="condition" label="Condition" required error={errors.condition}>
            <select name="condition" value={form.condition} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="good">Good</option>
              <option value="under_repair">Under Repair</option>
              <option value="damaged">Damaged</option>
            </select>
          </Field>
          
          <Field name="location" label="Location" value={form.location} onChange={handleChange} error={errors.location} />
          <Field name="purchase_price" label="Purchase Price" type="number" value={form.purchase_price} onChange={handleChange} error={errors.purchase_price} />
          <Field name="purchase_date" label="Purchase Date" type="date" value={form.purchase_date} onChange={handleChange} error={errors.purchase_date} />
          <Field name="photo" label="Photo (Optional)" type="file" accept="image/*" onChange={handleChange} error={errors.photo} />
        </div>
        
        <Field name="description" label="Description" error={errors.description}>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="Item description (optional)" />
        </Field>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/items')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}