import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, Edit, Trash2, MapPin, Package, 
  CalendarDays, ReceiptText, Clock3, History, Image as ImageIcon 
} from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price || 0);
};

const formatDate = (dateString) => {
  if(!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'});
};

const conditionBadge = {
  good: 'bg-green-100 text-green-700',
  damaged: 'bg-red-100 text-red-700',
  under_repair: 'bg-yellow-100 text-yellow-700',
};

const borrowStatusConfig = {
  waiting: { label: 'Waiting', class: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Accepted', class: 'bg-blue-100 text-blue-700' },
  borrowed: { label: 'Borrowed', class: 'bg-purple-100 text-purple-700' },
  returned: { label: 'Returned', class: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManageItems } = useAuth(); 
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api.get(`/items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(error => {
        console.error("Error fetching item details:", error);
        alert("Failed to load item details. Item might not exist.");
        navigate('/items');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/items/${id}`);
      navigate('/items');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading details...</div>;
  if (!item) return <div className="text-center py-20 text-gray-400">Item not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/items')} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-2xl font-bold text-gray-900">{item.item_name}</div>
            <div className="text-sm text-gray-500">Code: {item.item_code} • Added by: {item.created_by?.name || 'System'}</div>
          </div>
        </div>
        
        {canManageItems() && (
          <div className="flex items-center gap-2">
            <Link to={`/items/${item.item_code}/edit`}
              className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Edit size={16} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
              {deleting ? 'Deleting...' : <><Trash2 size={16} /> Delete</>}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Package size={18} className="text-blue-500" /> General Information
            </h3>
            
            {/* TAMPILAN FOTO (Ditambahkan) */}
            <div className="mb-6">
              {item.photo ? (
                <img 
                  // Asumsi URL storage default Laravel
                  src={`http://localhost:8000/storage/${item.photo}`} 
                  alt={item.item_name} 
                  className="w-full max-h-80 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-40 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-sm">No photo available</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium text-gray-800 mt-0.5">{item.category}</p>
              </div>
              <div>
                <p className="text-gray-500">Condition</p>
                <span className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium capitalize ${conditionBadge[item.condition]}`}>
                  {item.condition?.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium text-gray-800 mt-0.5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" /> {item.location || '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Stock Status</p>
                <p className="font-medium text-gray-800 mt-0.5">
                  <span className="text-2xl font-bold text-blue-600">{item.available_quantity}</span>
                  <span className="text-gray-400"> / {item.total_quantity} unit(s) available</span>
                </p>
              </div>
            </div>

            {item.description && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-500 text-sm mb-1.5">Description</p>
                <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-line">{item.description}</p>
              </div>
            )}
          </div>

          {/* Borrowing History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <History size={18} className="text-blue-500" /> Borrowing History
            </h3>
            
            <div className="space-y-4">
              {item.borrows && item.borrows.length > 0 ? (
                item.borrows.slice(0, 5).map(borrow => (
                  <div key={borrow.id} className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        {borrow.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{borrow.user?.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {/* SESUAIKAN DENGAN BACKEND: Ubah ke return_date_plan */}
                          <Clock3 size={12} /> {formatDate(borrow.borrow_date)} → {formatDate(borrow.return_date_plan)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{borrow.quantity} unit(s)</p>
                      <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-xs font-medium capitalize ${borrowStatusConfig[borrow.status]?.class || 'bg-gray-100 text-gray-700'}`}>
                        {borrowStatusConfig[borrow.status]?.label || borrow.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400 text-sm">No borrowing records yet.</div>
              )}
              
              {item.borrows && item.borrows.length > 5 && (
                <div className="text-center pt-2">
                  <Link to="/borrows" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all records</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Details (Financial) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit md:sticky md:top-6">
          <h3 className="font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <ReceiptText size={18} className="text-blue-500" /> Acquisition Details
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <CalendarDays className="text-gray-400" size={18} />
              <div>
                <p className="text-gray-500 text-xs">Purchase Date</p>
                <p className="font-medium text-gray-800">{formatDate(item.purchase_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <ReceiptText className="text-gray-400" size={18} />
              <div>
                <p className="text-gray-500 text-xs">Purchase Price</p>
                <p className="font-semibold text-gray-900 text-base">{formatPrice(item.purchase_price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}