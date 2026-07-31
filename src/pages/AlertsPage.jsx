import { useState } from 'react';
import { alerts } from '../data/mockData';
import Badge from '../components/common/Badge';
import SearchBar from '../components/common/SearchBar';
import { Bell, CheckCircle, Settings } from 'lucide-react';

export default function AlertsPage() {
  const [alertList, setAlertList] = useState(alerts);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = alertList.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.asset.toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter && a.severity !== severityFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const markResolved = (id) => setAlertList((prev) => prev.map((a) => a.id === id ? { ...a, status: 'Resolved' } : a));
  const markAllRead = () => setAlertList((prev) => prev.map((a) => ({ ...a, status: 'Resolved' })));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{alertList.filter((a) => a.status === 'Active').length} active alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <CheckCircle className="w-4 h-4" /> Mark all as read
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search alerts..." className="flex-1" />
        <div className="flex gap-2">
          {['', 'Critical', 'High', 'Warning', 'Info'].map((s) => (
            <button key={s} onClick={() => setSeverityFilter(s)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${severityFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-5 transition-all hover:shadow-md ${
            alert.status === 'Active' ? 'border-l-4 border-l-primary-500 border-t border-r border-b border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-1.5 rounded-lg ${
                  alert.severity === 'Critical' ? 'bg-red-100 dark:bg-red-900/30' :
                  alert.severity === 'High' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  alert.severity === 'Warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <Bell className={`w-4 h-4 ${
                    alert.severity === 'Critical' ? 'text-red-500' :
                    alert.severity === 'High' ? 'text-orange-500' :
                    alert.severity === 'Warning' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                    <Badge value={alert.severity} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    <span>Asset: {alert.asset}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {alert.status === 'Active' && (
                <button onClick={() => markResolved(alert.id)} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
