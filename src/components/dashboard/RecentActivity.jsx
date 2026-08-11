import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

import { getActivityLogs } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleString();
}

function ResultBadge({ result }) {
  const success = String(result || '').toLowerCase() === 'success';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        success
          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      {success ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}

      {result || 'Unknown'}
    </span>
  );
}

const RecentActivity = forwardRef(function RecentActivity(_, ref) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadActivity(showLoading = false) {
    try {
      if (showLoading) {
        setRefreshing(true);
      }

      setError('');

      const response = await getActivityLogs();

      setLogs((response.logs || []).slice(0, 5));
    } catch (err) {
      console.error('Dashboard activity error:', err);
      setError(err.message || 'Failed to load activity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useImperativeHandle(ref, () => ({
    refresh: () => loadActivity(true),
  }));

  useEffect(() => {
    loadActivity();

    const interval = setInterval(() => {
      loadActivity();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Latest cloud inventory events
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadActivity(true)}
          disabled={refreshing}
          title="Refresh activity"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-60 transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="w-8 h-8 mx-auto text-gray-400 mb-2" />

            <p className="text-sm text-gray-500 dark:text-gray-400">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action || 'Activity'}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {log.resource || 'AWS Inventory'}
                        {log.resourceType
                          ? ` • ${log.resourceType}`
                          : ''}
                      </p>
                    </div>

                    <ResultBadge result={log.result} />
                  </div>

                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTimestamp(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default RecentActivity;
