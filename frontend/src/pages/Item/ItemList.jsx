import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Package, Edit, Trash2, Eye } from 'lucide-react';

const statusBadge = {
  good: 'bg-green-100 text-green-700',
  under_repair: 'bg-yellow-100 text-yellow-700',
  damaged: 'bg-red-100 text-red-700',
  out_of_stock: 'bg-gray-100 text-gray-700',
};

export default function ItemList() {
  const { canManageItems } = useAuth(); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get('/items', { params: { search, condition, page, per_page: 10 } })
      .then(res => {
        setItems(res.data.data);
        setMeta(res.data);
      })
      .finally(() => setLoading(false));
  }, [search, condition, page]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setDeleting(id);
    try {
      await api.delete(`/items/${id}`);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Item Inventory</h2>
          <p className="text-gray-500 text-sm">List of all office equipment</p>
        </div>
        {canManageItems() && (
          <Link to="/items/add"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Add Item
          </Link>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, code, or category..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={condition}
            onChange={e => { setCondition(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Conditions</option>
            <option value="good">Good</option>
            <option value="under_repair">Under Repair</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Package size={40} className="mb-2 opacity-30" />
            <p>No items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Item</th>
                  <th className="text-left px-5 py-3 text-gray-600 font-medium">Category</th>
                  <th className="text-center px-5 py-3 text-gray-600 font-medium">Stock</th>
                  <th className="text-center px-5 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => {
                  // Penentuan badge status
                  const status = item.available_quantity === 0 ? 'out_of_stock' : item.condition;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">{item.item_name}</p>
                        <p className="text-xs text-gray-400">{item.item_code} • {item.location || 'No Location'}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{item.category}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="font-medium">{item.available_quantity}</span>
                        <span className="text-gray-400">/{item.total_quantity}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge[status] || statusBadge.good}`}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/items/${item.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye size={16} />
                          </Link>
                          {canManageItems() && (
                            <>
                              <Link to={`/items/${item.id}/edit`}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <Edit size={16} />
                              </Link>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deleting === item.id}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {meta.from}–{meta.to} of {meta.total} items
            </p>
            <div className="flex gap-1">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1 text-sm rounded-lg ${p === meta.current_page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}