import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Check, X, RotateCcw, Calendar, User, Package, MessageSquare } from 'lucide-react';

const statusConfig = {
  waiting: { label: 'Waiting', class: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
  accepted: { label: 'Accepted', class: 'bg-blue-100 text-blue-700 border border-blue-200' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 border border-red-200' },
  returned: { label: 'Returned', class: 'bg-green-100 text-green-700 border border-green-200' },
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
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

  const handleAction = async (borrow_code, action, note = '') => {
    setActionLoading(`${borrow_code}-${action}`);
    try {
      await api.post(`/borrows/${borrow_code}/${action}`, { admin_notes: note });
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to process request');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = (borrow_code) => {
    const note = prompt('Reason for rejection:');
    if (note) handleAction(borrow_code, 'reject', note);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">Borrow Requests</div>
          <div className="text-gray-500 text-sm mt-1">
            {canApprove() ? 'Manage all borrowing requests' : 'Track your borrowing requests'}
          </div>
        </div>
        <Link to="/borrows/request"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={18} /> Request Borrow
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
        {[
          { v: '', l: 'All Requests' }, 
          { v: 'waiting', l: 'Waiting' }, 
          { v: 'accepted', l: 'Accepted' }, 
          { v: 'returned', l: 'Returned' }, 
          { v: 'rejected', l: 'Rejected' }
        ].map(s => (
          <button key={s.v} onClick={() => { setStatus(s.v); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              status === s.v 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}>
            {s.l}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p>Loading requests...</p>
          </div>
        ) : borrows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No records found</p>
            <p className="text-sm">Try changing the filter or request a new borrow.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {borrows.map(b => (
              <div key={b.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">
                        {b.item?.item_name || 'Unknown Item'}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusConfig[b.status]?.class || 'bg-gray-100 text-gray-700'}`}>
                        {statusConfig[b.status]?.label || b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                      {canApprove() && (
                        <div className="flex items-center gap-2">
                          <User size={15} className="text-gray-400" />
                          <span className="font-medium">{b.user?.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Package size={15} className="text-gray-400" />
                        <span>Qty: <strong className="text-gray-800">{b.quantity} unit(s)</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-gray-400" />
                        <span>{formatDate(b.borrow_date)} <span className="text-gray-400 mx-1">→</span> {formatDate(b.return_date_plan)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          Code: {b.borrow_code}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm border border-gray-100">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-gray-700"><span className="font-medium text-gray-900">Purpose:</span> {b.purpose}</p>
                      </div>
                      {b.admin_notes && (
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-200">
                          <Check size={14} className={b.status === 'rejected' ? "text-red-400 mt-0.5 shrink-0" : "text-blue-400 mt-0.5 shrink-0"} />
                          <p className={b.status === 'rejected' ? "text-red-700" : "text-blue-700"}>
                            <span className="font-medium">Admin Note:</span> {b.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {canApprove() && (
                    <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                      {b.status === 'waiting' && (
                        <>
                          <button
                            onClick={() => handleAction(b.borrow_code, 'accept')}
                            disabled={!!actionLoading}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border border-green-200 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                            <Check size={16} /> Approve
                          </button>
                          <button
                            onClick={() => confirmReject(b.borrow_code)}
                            disabled={!!actionLoading}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                            <X size={16} /> Reject
                          </button>
                        </>
                      )}
                      {b.status === 'accepted' && (
                        <button
                          onClick={() => handleAction(b.borrow_code, 'return')}
                          disabled={!!actionLoading}
                          className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
                          <RotateCcw size={16} /> Mark Returned
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{meta.from}</span> to <span className="font-medium text-gray-900">{meta.to}</span> of <span className="font-medium text-gray-900">{meta.total}</span> requests
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
                    p === meta.current_page 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}>
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