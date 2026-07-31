import { useState } from 'react';
import { securityFindings, complianceData, assetsByService, assets } from '../data/mockData';
import Badge from '../components/common/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, AlertTriangle, Eye, Unlock, FileWarning } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SecurityPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#e5e7eb';
  const [severityFilter, setSeverityFilter] = useState('');
  const filtered = severityFilter ? securityFindings.filter((f) => f.severity === severityFilter) : securityFindings;

  const summaryCards = [
    { icon: Shield, label: 'Total Security Findings', value: securityFindings.length, color: 'bg-blue-500' },
    { icon: AlertTriangle, label: 'Critical Findings', value: securityFindings.filter((f) => f.severity === 'Critical').length, color: 'bg-red-500' },
    { icon: Eye, label: 'Publicly Exposed Assets', value: assets.filter((a) => a.security.publicAccess).length, color: 'bg-orange-500' },
    { icon: Unlock, label: 'Unencrypted Resources', value: assets.filter((a) => !a.security.encrypted).length, color: 'bg-yellow-500' },
    { icon: FileWarning, label: 'Non-Compliant Assets', value: assets.filter((a) => a.security.complianceScore < 80).length, color: 'bg-purple-500' },
  ];

  const severityData = [
    { name: 'Critical', count: securityFindings.filter((f) => f.severity === 'Critical').length, color: '#ef4444' },
    { name: 'High', count: securityFindings.filter((f) => f.severity === 'High').length, color: '#f97316' },
    { name: 'Medium', count: securityFindings.filter((f) => f.severity === 'Medium').length, color: '#eab308' },
    { name: 'Low', count: securityFindings.filter((f) => f.severity === 'Low').length, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Compliance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Security posture and compliance monitoring</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className={`p-2 rounded-lg ${card.color} w-fit mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Findings by Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} cursor={false} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} activeBar={false}>
                {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Compliance Score</h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray={`${complianceData.overall * 2.51} 251`} strokeLinecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{complianceData.overall}%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {complianceData.categories.slice(0, 3).map((cat) => (
              <div key={cat.name} className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">{cat.name}</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{cat.score}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Findings by Service</h3>
          <div className="space-y-3">
            {assetsByService.slice(0, 5).map((svc) => (
              <div key={svc.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{svc.name}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-primary-500" style={{ width: `${(svc.count / 160) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{svc.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Security Findings</h3>
          <div className="flex gap-2">
            {['', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
              <button key={s} onClick={() => setSeverityFilter(s)} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${severityFilter === s ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {['Finding ID', 'Asset', 'Severity', 'Rule', 'Status', 'Detected'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{f.id}</td>
                  <td className="px-5 py-3 text-sm font-medium text-primary-600 dark:text-primary-400">{f.assetName}</td>
                  <td className="px-5 py-3"><Badge value={f.severity} /></td>
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{f.rule}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${f.status === 'Open' ? 'text-red-500' : 'text-green-500'}`}>{f.status}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(f.detectedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
