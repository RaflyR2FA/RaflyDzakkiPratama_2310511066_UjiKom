import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Check, X, RotateCcw } from 'lucide-react'; 

const statusConfig = {
  pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approved', class: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
  borrowed: { label: 'Borrowed', class: 'bg-purple-100 text-purple-700' },
  returned: { label: 'Returned', class: 'bg-green-100 text-green-700' },
};

export default function BorrowList() {
  const { canApprove } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.get('/borrows', { params: { status, page, per_page: 10 } })
      .then(res => { 
        setBorrows(res.data.data); 
        setMeta(res.data); 
      })
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(); 
  }, [fetchData]);

  const handleAction = async (id, action, note = '') => {
    setActionLoading(`${id}-${action}`);
    try {
      await api.post(`/borrows/${id}/${action}`, { admin_note: note });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to process request');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = (id) => {
    const note = prompt('Reason for rejection:');
    if (note) handleAction(id, 'reject', note);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Borrow Requests</h2>
          <p className="text-gray-500 text-sm">
            {canApprove() ? 'Manage all borrowing requests' : 'Your borrowing requests'}
          </p>
        </div>
        <Link to="/borrows/request"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Request Borrow
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { v: '', l: 'All' }, 
          { v: 'pending', l: 'Pending' }, 
          { v: 'approved', l: 'Approved' }, 
          { v: 'returned', l: 'Returned' }, 
          { v: 'rejected', l: 'Rejected' }
        ].map(s => (
          <button key={s.v} onClick={() => { setStatus(s.v); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${status === s.v ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s.l}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Loading...</div>
        ) : borrows.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No borrowing records found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {borrows.map(b => (
              <div key={b.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">{b.item?.item_name}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[b.status]?.class || 'bg-gray-100 text-gray-700'}`}>
                        {statusConfig[b.status]?.label || b.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {canApprove() && <span className="font-medium">{b.user?.name} • </span>}
                      Quantity: {b.quantity} unit(s) • {b.borrow_code}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.borrow_date} → {b.planned_return_date} • {b.purpose}
                    </p>
                    {b.admin_note && (
                      <p className="text-xs text-blue-600 mt-1">Note: {b.admin_note}</p>
                    )}
                  </div>

                  {canApprove() && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(b.id, 'approve')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => confirmReject(b.id)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                            <X size={14} /> Reject
                          </button>
                        </>
                      )}
                      {b.status === 'approved' && (
                        <button
                          onClick={() => handleAction(b.id, 'return')} 
                          disabled={!!actionLoading}
                          className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          <RotateCcw size={14} /> Mark as Returned
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {meta.from}–{meta.to} of {meta.total}</p>
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