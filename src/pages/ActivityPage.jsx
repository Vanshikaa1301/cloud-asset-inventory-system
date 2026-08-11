import { useEffect, useMemo, useState } from 'react';
import { Download, Activity } from 'lucide-react';

import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { getActivityLogs } from '../services/api';

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivityLogs();
  }, []);

  async function loadActivityLogs() {
    try {
      setLoading(true);
      setError('');

      const response = await getActivityLogs();

      setLogs(response.logs || []);
    } catch (err) {
      console.error('Activity logs error:', err);
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }

  const users = useMemo(() => {
    return [...new Set(logs.map((log) => log.user).filter(Boolean))];
  }, [logs]);

  const filtered = logs.filter((log) => {
    const searchTerm = search.toLowerCase();

    if (
      search &&
      !String(log.resource || '').toLowerCase().includes(searchTerm) &&
      !String(log.action || '').toLowerCase().includes(searchTerm) &&
      !String(log.user || '').toLowerCase().includes(searchTerm)
    ) {
      return false;
    }

    if (userFilter && log.user !== userFilter) {
      return false;
    }

    return true;
  });

  const resultColors = {
    Success: 'text-green-600 dark:text-green-400',
    Failed: 'text-red-500',
  };

  function exportLogs() {
    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Resource',
      'Type',
      'Cloud Account',
      'IP Address',
      'Result',
    ];

    const rows = filtered.map((log) => [
      log.timestamp,
      log.user,
      log.action,
      log.resource,
      log.resourceType,
      log.cloudAccount,
      log.ipAddress,
      log.result,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `activity-logs-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activity Logs
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} entries
          </p>
        </div>

        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search logs..."
          className="flex-1"
        />

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          <option value="">All users</option>

          {users.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {[
                  'Timestamp',
                  'User',
                  'Action',
                  'Resource',
                  'Type',
                  'Cloud Account',
                  'IP Address',
                  'Result',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {log.user}
                  </td>

                  <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {log.action}
                  </td>

                  <td className="px-5 py-3 text-sm text-primary-600 dark:text-primary-400">
                    {log.resource}
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {log.resourceType}
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {log.cloudAccount}
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {log.ipAddress}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`text-sm font-medium ${
                        resultColors[log.result] || 'text-gray-500'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      No activity logs found
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Activity generated by the backend will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
