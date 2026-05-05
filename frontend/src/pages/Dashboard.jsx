import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, CheckCircle, Clock, Archive } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      Loading data...
    </div>
  );

  const { stats, popular_items } = data;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold text-gray-900">Dashboard</div>
        <div className="text-gray-500 text-sm">Asetia Kabar Pangan - Quick overview</div>
      </div>

      {/* Hanya 4 Metrik Paling Penting untuk Operasional Sehari-hari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Items" value={stats.total_items} color="text-blue-600" />
        <StatCard icon={CheckCircle} label="Available" value={stats.available_items} color="text-green-600" />
        <StatCard icon={Archive} label="Active Borrows" value={stats.active_borrows} color="text-cyan-600" />
        <StatCard icon={Clock} label="Pending Requests" value={stats.waiting_borrows} color="text-orange-500" />
      </div>

      {/* Tampilan List Sederhana tanpa Custom Progress Bar yang rumit */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Most Borrowed Items</h3>
        <div className="divide-y divide-gray-50">
          {popular_items.map((item, i) => (
            <div key={item.id} className="py-3 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors -mx-2">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 font-medium w-5 text-right">{i + 1}.</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.item_name}</p>
                  <p className="text-xs text-gray-500">{item.category} • {item.item_code}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                {item.total_borrowed}x Borrowed
              </span>
            </div>
          ))}
          {popular_items.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-6 border border-dashed border-gray-200 rounded-lg">
              No borrow data available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}