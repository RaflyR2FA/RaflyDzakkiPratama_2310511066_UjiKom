import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Package, ClipboardList, CheckCircle, AlertTriangle,
  Users, Clock, TrendingUp, Archive
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')}`}>
          <Icon size={22} className={color} />
        </div>
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

  // Disesuaikan dengan keys JSON dari backend Laravel Anda
  const { stats, borrows_per_month, popular_items, category_distribution } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm">Office equipment inventory summary</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Items" value={stats.total_items} color="text-blue-600" />
        <StatCard icon={CheckCircle} label="Available" value={stats.available_items} color="text-green-600" />
        <StatCard icon={AlertTriangle} label="Damaged" value={stats.damaged_items} color="text-red-500" />
        <StatCard icon={Clock} label="Pending" value={stats.waiting_borrows} color="text-orange-500" sub="awaiting approval" />
        <StatCard icon={ClipboardList} label="Total Borrows" value={stats.total_borrows} color="text-purple-600" />
        <StatCard icon={Archive} label="Active Borrows" value={stats.active_borrows} color="text-cyan-600" />
        <StatCard icon={Users} label="Total Users" value={stats.total_users} color="text-indigo-600" />
        {/* Menggunakan nilai returned_borrows langsung dari backend */}
        <StatCard icon={TrendingUp} label="Returned" value={stats.returned_borrows} color="text-teal-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrows per Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Borrowing (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={borrows_per_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              {/* Sumbu X diganti ke 'month' */}
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" name="Total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              {/* Kolom dikembalikan diganti ke 'returned' */}
              <Bar dataKey="returned" name="Returned" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              {/* dataKey diganti 'count', nameKey diganti 'category' */}
              <Pie 
                data={category_distribution} 
                dataKey="count" 
                nameKey="category" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`} 
                labelLine={false}
              >
                {category_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Most Borrowed Items</h3>
        <div className="space-y-3">
          {popular_items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                {/* Penyesuaian ke item_name dan category */}
                <p className="text-sm font-medium text-gray-800 truncate">{item.item_name}</p>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  // Penyesuaian ke total_borrowed
                  style={{ width: `${(item.total_borrowed / (popular_items[0]?.total_borrowed || 1)) * 100}px` }}
                />
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">
                  {item.total_borrowed}x
                </span>
              </div>
            </div>
          ))}
          {popular_items.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No borrow data available</p>
          )}
        </div>
      </div>
    </div>
  );
}