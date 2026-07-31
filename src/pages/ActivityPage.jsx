import { useState } from 'react';
import { activityLogs } from '../data/mockData';
import SearchBar from '../components/common/SearchBar';
import { Download } from 'lucide-react';

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const filtered = activityLogs.filter((log) => {
    if (search && !log.resource.toLowerCase().includes(search.toLowerCase()) && !log.action.toLowerCase().includes(search.toLowerCase())) return false;
    if (userFilter && log.user !== userFilter) return false;
    return true;
  });

  const resultColors = { Success: 'text-green-600 dark:text-green-400', Failed: 'text-red-500' };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} entries</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Download className="w-4 h-4" /> Export Logs
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search logs..." className="flex-1" />
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          <option value="">All users</option>
          <option value="System">System</option>
          <option value="admin@company.com">admin@company.com</option>
          <option value="devops@company.com">devops@company.com</option>
          <option value="security@company.com">security@company.com</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {['Timestamp', 'User', 'Action', 'Resource', 'Type', 'Cloud Account', 'IP Address', 'Result'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{log.user}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{log.action}</td>
                  <td className="px-5 py-3 text-sm text-primary-600 dark:text-primary-400">{log.resource}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{log.resourceType}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{log.cloudAccount}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{log.ipAddress}</td>
                  <td className="px-5 py-3"><span className={`text-sm font-medium ${resultColors[log.result] || 'text-gray-500'}`}>{log.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
