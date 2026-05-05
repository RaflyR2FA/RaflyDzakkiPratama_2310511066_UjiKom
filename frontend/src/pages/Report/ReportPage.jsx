import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Filter, Package, AlertTriangle, Users,
  ArrowRightLeft, CheckCircle, Activity,
  ClipboardList, Clock, RotateCcw
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

export default function ReportPage() {
  const { isAdmin } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [filter, setFilter] = useState({
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const [logs, setLogs] = useState([]);
  const [logMeta, setLogMeta] = useState({});
  const [logPage, setLogPage] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    api.get('/reports/dashboard').then(res => setDashboardData(res.data));
  }, []);

  useEffect(() => {
    if (isAdmin()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingLogs(true);
      api.get('/reports/activity-log', { params: { page: logPage } })
        .then(res => {
          setLogs(res.data.data);
          setLogMeta(res.data);
        })
        .catch(err => console.error('Failed to fetch logs:', err))
        .finally(() => setLoadingLogs(false));
    }
  }, [isAdmin, logPage]);

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
        <div className="text-2xl font-bold text-gray-900">Reports & Analytics</div>
        <div className="text-gray-500 text-sm">Inventory and borrow summary overview</div>
      </div>

      {dashboardData && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Total Items</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.total_items}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Available</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.available_items}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Damaged</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.damaged_items}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Users size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Total Users</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.total_users}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><ClipboardList size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Total Borrows</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.total_borrows}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Waiting Borrows</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.waiting_borrows}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><ArrowRightLeft size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Active Borrows</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.active_borrows}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-lg"><RotateCcw size={24} /></div>
              <div>
                <p className="text-sm text-gray-500 mb-0.5">Returned</p>
                <p className="text-xl font-bold text-gray-900 leading-none">{dashboardData.stats.returned_borrows}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-6">Borrowing Trend (Last 6 Months)</h3>
              <div className="w-full h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.borrows_per_month} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                    <Line type="monotone" dataKey="total" name="Total Requested" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="returned" name="Successfully Returned" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-6 text-center">Items by Category</h3>
              <div style={{ width: '100%', height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.category_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="category"
                    >
                      {dashboardData.category_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} Kategori Barang`, name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 px-4">
                {dashboardData.category_distribution.map((cat, index) => (
                  <div key={cat.category} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-sm text-gray-600 font-medium">
                      {cat.category} ({cat.total_units} Unit)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Most Borrowed Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Item Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium text-center rounded-tr-lg">Times Borrowed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dashboardData.popular_items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.item_code}</td>
                      <td className="px-4 py-3 text-gray-700">{item.item_name}</td>
                      <td className="px-4 py-3 text-gray-500">{item.category}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg">
                          {item.total_borrowed}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {dashboardData.popular_items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-6 text-gray-400">No borrowing data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h3 className="font-semibold text-gray-800">Generate Custom Period Report</h3>
        <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
            <input type="date" value={filter.start_date}
              onChange={e => setFilter(p => ({ ...p, start_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
            <input type="date" value={filter.end_date}
              onChange={e => setFilter(p => ({ ...p, end_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button onClick={handleSummary} disabled={loadingSummary}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            <Filter size={16} /> {loadingSummary ? 'Processing...' : 'Generate Report'}
          </button>
        </div>

        {summary && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total Borrows', value: summary.total, color: 'text-gray-800' },
                { label: 'Waiting', value: summary.waiting, color: 'text-yellow-600' },
                { label: 'Approved/Accepted', value: summary.accepted, color: 'text-blue-600' },
                { label: 'Returned', value: summary.returned, color: 'text-green-600' },
                { label: 'Rejected', value: summary.rejected, color: 'text-red-500' },
              ].map(s => (
                <div key={s.label} className="text-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {summary.records && summary.records.length > 0 && (
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Borrow Code</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Item</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {summary.records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{record.borrow_code}</td>
                        <td className="px-4 py-3 text-gray-700">{record.user?.name}</td>
                        <td className="px-4 py-3 text-gray-500">{record.item?.item_name} (x{record.quantity})</td>
                        <td className="px-4 py-3 text-gray-500">{record.borrow_date}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${record.status === 'returned' ? 'bg-green-100 text-green-700' :
                            record.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                              record.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {summary.records?.length === 0 && (
              <p className="text-center text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                No borrow records found in this period.
              </p>
            )}
          </div>
        )}
      </div>

      {isAdmin() && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">System Activity Logs</h3>
          </div>

          {loadingLogs ? (
            <p className="text-center text-gray-400 py-8">Loading logs...</p>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {logs.map(log => (
                  <div key={log.id} className="py-3.5 flex items-start gap-4 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 text-sm flex items-center justify-center font-bold shrink-0 border border-slate-200">
                      {log.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span> performed <span className="font-medium text-blue-600">{log.action}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex gap-2">
                        <span>{log.model_type} #{log.model_id}</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-8">No activity log found.</p>
                )}
              </div>

              {logMeta?.last_page > 1 && (
                <div className="flex items-center justify-between pt-5 mt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing {logMeta.from}–{logMeta.to} of {logMeta.total} logs
                  </p>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {Array.from({ length: logMeta.last_page }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setLogPage(p)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === logMeta.current_page
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}