import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Filter } from 'lucide-react';

export default function ReportPage() {
  const { isAdmin } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filter, setFilter] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    api.get('/reports/dashboard').then(res => setDashboardData(res.data));
    if (isAdmin()) {
      api.get('/reports/activity-log').then(res => setLogs(res.data.data));
    }
  }, [isAdmin]);

  const handleSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await api.get('/reports/summary', { params: filter });
      setSummary(res.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      alert(error.response?.data?.message || 'Failed to fetch summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-gray-500 text-sm">Inventory and borrow summary</p>
      </div>

      {/* Peminjaman Per Bulan Chart */}
      {dashboardData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Borrowing Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            {/* Pastikan backend mengembalikan properti 'borrows_per_month' */}
            <LineChart data={dashboardData.borrows_per_month}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total Borrows" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="returned" name="Returned" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Rekap Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Period Summary</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input type="date" value={filter.start_date}
              onChange={e => setFilter(p => ({ ...p, start_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input type="date" value={filter.end_date}
              onChange={e => setFilter(p => ({ ...p, end_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={handleSummary} disabled={loadingSummary}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            <Filter size={16} /> {loadingSummary ? 'Processing...' : 'Show Summary'}
          </button>
        </div>

        {summary && (
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Total', value: summary.total_borrows, color: 'text-gray-800' },
                { label: 'Approved', value: summary.approved, color: 'text-blue-600' },
                { label: 'Returned', value: summary.returned, color: 'text-green-600' },
                { label: 'Rejected', value: summary.rejected, color: 'text-red-500' },
              ].map(s => (
                <div key={s.label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Period: {summary.period?.from} to {summary.period?.to}
            </p>
          </div>
        )}
      </div>

      {/* Activity Log (Admin Only) */}
      {isAdmin() && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity Logs</h3>
          <div className="divide-y divide-gray-50">
            {logs.slice(0, 15).map(log => (
              <div key={log.id} className="py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {log.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{log.user?.name}</span> — {log.action}
                  </p>
                  <p className="text-xs text-gray-400">{log.model_type} #{log.model_id} • {new Date(log.created_at).toLocaleString('en-US')}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}