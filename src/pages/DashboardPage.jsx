import { Cloud, Server, AlertTriangle, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardStats, assetsByService, assetsByRegion, assetHealth, assetGrowthData, assets } from '../data/mockData';
import Badge from '../components/common/Badge';
import { useTheme } from '../context/ThemeContext';

function StatCard({ icon: Icon, label, value, change, changeType, color }) {
  const isPositive = changeType === 'positive';
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(change)}{typeof change === 'number' && changeType === 'positive' ? '' : ''}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' && label.includes('Cost') ? `$${value.toLocaleString()}` : value.toLocaleString()}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

const CHART_COLORS = ['#FF9900', '#3F8624', '#C925D1', '#FF9900', '#8C4FFF', '#DD344C', '#8C4FFF', '#6B7280'];

export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#e5e7eb';
  const recentAssets = assets.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your cloud infrastructure</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Cloud} label="Total Cloud Assets" value={dashboardStats.totalAssets} change={dashboardStats.totalAssetsChange} changeType="positive" color="bg-primary-500" />
        <StatCard icon={Server} label="Active Resources" value={dashboardStats.activeResources} change={dashboardStats.activeResourcesChange} changeType="positive" color="bg-green-500" />
        <StatCard icon={AlertTriangle} label="Critical Findings" value={dashboardStats.criticalFindings} change={dashboardStats.criticalFindingsChange} changeType="negative" color="bg-red-500" />
        <StatCard icon={Trash2} label="Unused Resources" value={dashboardStats.unusedResources} change={dashboardStats.unusedResourcesChange} changeType="positive" color="bg-yellow-500" />
        <StatCard icon={DollarSign} label="Estimated Monthly Cost" value={dashboardStats.estimatedMonthlyCost} change={Math.abs(dashboardStats.costChange)} changeType="positive" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assets by Cloud Service</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assetsByService}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} cursor={false} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} activeBar={false}>
                {assetsByService.map((entry, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Assets by Region</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={assetsByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis type="number" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} cursor={false} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Asset Health Overview</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={240}>
              <PieChart>
                <Pie data={assetHealth} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none">
                  {assetHealth.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {assetHealth.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Asset Growth Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={assetGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} cursor={false} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Asset Changes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Asset Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Provider</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Region</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.type}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{asset.provider}</td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">{asset.region}</td>
                  <td className="px-5 py-3"><Badge value={asset.status} /></td>
                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {new Date(asset.lastScanned).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
