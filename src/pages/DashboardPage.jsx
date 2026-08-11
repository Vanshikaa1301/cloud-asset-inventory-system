import { useEffect, useMemo, useState } from 'react';
import {
  Cloud,
  Server,
  AlertTriangle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  getInventory,
  getActivityLogs,
  getAssetStatistics,
  scanAllAssets,
} from '../services/api';
import { useTheme } from '../context/ThemeContext';
import RecentActivity from '../components/dashboard/RecentActivity';

function StatCard({ icon: Icon, label, value, change, changeType, color }) {
  const isPositive = changeType === 'positive';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {Math.abs(change)}%
        </div>
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

const CHART_COLORS = [
  '#FF9900',
  '#3F8624',
  '#C925D1',
  '#8C4FFF',
  '#DD344C',
  '#3b82f6',
];

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [assets, setAssets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError('');

      const [inventoryResponse, activityResponse, statisticsResponse] =
  await Promise.all([
    getInventory(),
    getActivityLogs(),
    getAssetStatistics(),
  ]);

  setAssets(inventoryResponse.assets || []);
  setActivities(activityResponse.logs || []);
  setStatistics(statisticsResponse.statistics || null);
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function handleScan() {
    try {
      setScanning(true);
      setScanMessage('');
      setError('');

      const response = await scanAllAssets();

      setScanMessage(
        response.message || 'AWS asset scan completed successfully.'
      );

      await loadDashboardData();
    } catch (err) {
      console.error('AWS asset scan error:', err);
      setScanMessage('');
      setError(err.message || 'Failed to scan AWS assets');
    } finally {
      setScanning(false);
    }
  }

  const dashboardData = useMemo(() => {
    const totalAssets = statistics?.totalAssets ?? assets.length;

    const activeResources = assets.filter(
      (asset) =>
        asset.status === 'running' ||
        asset.status === 'available' ||
        asset.status === 'active'
    ).length;

    const criticalFindings = 0;

    const unusedResources = assets.filter(
      (asset) =>
        asset.status === 'stopped' ||
        asset.status === 'unused' ||
        asset.status === 'inactive'
    ).length;

    const serviceCounts = {};

    assets.forEach((asset) => {
      const type = asset.assetType || 'Unknown';
      serviceCounts[type] = (serviceCounts[type] || 0) + 1;
    });

    const assetsByService = Object.entries(serviceCounts).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    const regionCounts = {};

    assets.forEach((asset) => {
      const region = asset.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    const assetsByRegion = Object.entries(regionCounts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const running = assets.filter(
      (asset) => asset.status === 'running'
    ).length;

    const available = assets.filter(
      (asset) => asset.status === 'available'
    ).length;

    const active = assets.filter(
      (asset) => asset.status === 'active'
    ).length;

    const other = totalAssets - running - available - active;

    const assetHealth = [
      { name: 'Running', value: running, color: '#22c55e' },
      { name: 'Available', value: available, color: '#3b82f6' },
      { name: 'Active', value: active, color: '#8b5cf6' },
      { name: 'Other', value: Math.max(other, 0), color: '#94a3b8' },
    ].filter((item) => item.value > 0);

    return {
      totalAssets,
      activeResources,
      criticalFindings,
      unusedResources,
      assetsByService,
      assetsByRegion,
      assetHealth,
    };
  }, [assets, statistics]);

  const gridStroke = isDark ? '#334155' : '#e5e7eb';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && assets.length === 0) {
    return <ErrorState message={error} />;
  }

  const recentAssets = assets.slice(0, 6);
  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live overview of your AWS cloud infrastructure
          </p>
        </div>

        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`}
          />

          {scanning ? 'Scanning AWS...' : 'Scan AWS Assets'}
        </button>
      </div>

      {scanMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          {scanMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Cloud}
          label="Total Cloud Assets"
          value={dashboardData.totalAssets}
          change={0}
          changeType="positive"
          color="bg-primary-500"
        />

        <StatCard
          icon={Server}
          label="Active Resources"
          value={dashboardData.activeResources}
          change={0}
          changeType="positive"
          color="bg-green-500"
        />

        <StatCard
          icon={AlertTriangle}
          label="Critical Findings"
          value={dashboardData.criticalFindings}
          change={0}
          changeType="negative"
          color="bg-red-500"
        />

        <StatCard
          icon={Trash2}
          label="Unused Resources"
          value={dashboardData.unusedResources}
          change={0}
          changeType="positive"
          color="bg-yellow-500"
        />

        <StatCard
          icon={Cloud}
          label="AWS Resources"
          value={dashboardData.totalAssets}
          change={0}
          changeType="positive"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Assets by Cloud Service
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboardData.assetsByService}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12,
                  fill: isDark ? '#94a3b8' : '#6b7280',
                }}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                  fill: isDark ? '#94a3b8' : '#6b7280',
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
                cursor={false}
              />

              <Bar dataKey="count" radius={[4, 4, 0, 0]} activeBar={false}>
                {dashboardData.assetsByService.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Assets by Region
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboardData.assetsByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />

              <XAxis type="number" />

              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{
                  fontSize: 12,
                  fill: isDark ? '#94a3b8' : '#6b7280',
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
                cursor={false}
              />

              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                activeBar={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Asset Health Overview
          </h3>

          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={240}>
              <PieChart>
                <Pie
                  data={dashboardData.assetHealth}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  stroke="none"
                >
                  {dashboardData.assetHealth.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                  cursor={false}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-3">
              {dashboardData.assetHealth.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Asset Distribution
          </h3>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={dashboardData.assetsByRegion.map((item) => ({
                region: item.name,
                count: item.count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />

              <XAxis dataKey="region" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <RecentActivity />

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent AWS Asset Changes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Asset Name
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Provider
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Region
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>

                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Last Updated
                </th>
              </tr>
            </thead>

            <tbody>
              {recentAssets.map((asset) => (
                <tr
                  key={asset.assetId}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {asset.assetName || asset.assetId}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {asset.assetType}
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {asset.provider}
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {asset.region}
                  </td>

                  <td className="px-5 py-3">
                    <Badge value={asset.status} />
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {asset.lastScanned
                      ? new Date(asset.lastScanned).toLocaleString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}

              {recentAssets.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No AWS assets found.
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
