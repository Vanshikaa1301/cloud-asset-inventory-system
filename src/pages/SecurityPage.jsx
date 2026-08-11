import { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Eye,
  Unlock,
  FileWarning,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import {
  getInventory,
  getAssetStatistics,
  getSecurityFindings,
  resolveSecurityFinding,
} from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function SecurityPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#e5e7eb';

  const [assets, setAssets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [findings, setFindings] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  async function loadSecurityData() {
    try {
      setLoading(true);
      setError('');

      const [
        inventoryResponse,
        statisticsResponse,
        findingsResponse,
      ] = await Promise.all([
        getInventory(),
        getAssetStatistics(),
        getSecurityFindings(),
      ]);

      setAssets(inventoryResponse.assets || []);
      setStatistics(statisticsResponse.statistics || null);
      setFindings(findingsResponse.findings || []);
    } catch (err) {
      console.error('Security data error:', err);
      setError(err.message || 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  }

  const securityData = useMemo(() => {
    const totalAssets = statistics?.totalAssets ?? assets.length;

    /*
     * Current inventory contains security-related information
     * for some AWS resources.
     */

    const publicAssets = assets.filter((asset) => {
      if (typeof asset.publicAccess === 'boolean') {
        return asset.publicAccess;
      }

      if (typeof asset.publicAccess === 'string') {
        return asset.publicAccess.toLowerCase() === 'true';
      }

      return false;
    });

    const unencryptedAssets = assets.filter((asset) => {
      if (typeof asset.encryption === 'string') {
        return (
          asset.encryption.toLowerCase() === 'not configured' ||
          asset.encryption.toLowerCase() === 'disabled'
        );
      }

      if (typeof asset.security?.encrypted === 'boolean') {
        return !asset.security.encrypted;
      }

      return false;
    });

    /*
     * Security findings are loaded from the backend and persisted
     * in DynamoDB. Resolved findings are excluded from active
     * security and compliance counts.
     */
    const criticalFindings = findings.filter(
      (finding) =>
        finding.severity === 'Critical' &&
        finding.status !== 'Resolved'
    ).length;

    const nonCompliantAssetIds = new Set(
      findings
        .filter(
          (finding) =>
            ['Critical', 'High'].includes(finding.severity) &&
            finding.status !== 'Resolved'
        )
        .map((finding) => finding.assetId || finding.assetName)
        .filter(Boolean)
    );

    const nonCompliantAssets = nonCompliantAssetIds.size;

    const byType = statistics?.byType || {};

    const assetsByService = Object.entries(byType).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    const severityData = [
      {
        name: 'Critical',
        count: findings.filter(
          (finding) =>
            finding.severity === 'Critical' &&
            finding.status !== 'Resolved'
        ).length,
        color: '#ef4444',
      },
      {
        name: 'High',
        count: findings.filter(
          (finding) =>
            finding.severity === 'High' &&
            finding.status !== 'Resolved'
        ).length,
        color: '#f97316',
      },
      {
        name: 'Medium',
        count: findings.filter(
          (finding) =>
            finding.severity === 'Medium' &&
            finding.status !== 'Resolved'
        ).length,
        color: '#eab308',
      },
      {
        name: 'Low',
        count: findings.filter(
          (finding) =>
            finding.severity === 'Low' &&
            finding.status !== 'Resolved'
        ).length,
        color: '#3b82f6',
      },
    ];

    return {
      totalAssets,
      criticalFindings,
      publicAssets,
      unencryptedAssets,
      nonCompliantAssets,
      assetsByService,
      severityData,
    };
  }, [assets, statistics, findings]);

  const filteredFindings = severityFilter
    ? findings.filter((finding) => finding.severity === severityFilter)
    : findings;

  async function handleResolve(findingId) {
    try {
      setResolvingId(findingId);

      await resolveSecurityFinding(
        findingId,
        'Admin',
        'Resolved from Security & Compliance dashboard.'
      );

      const response = await getSecurityFindings();
      setFindings(response.findings || []);
    } catch (err) {
      console.error('Resolve security finding error:', err);
      setError(err.message || 'Failed to resolve security finding');
    } finally {
      setResolvingId(null);
    }
  }

  const summaryCards = [
    {
      icon: Shield,
      label: 'Active Security Findings',
      value: findings.filter(
        (finding) => finding.status !== 'Resolved'
      ).length,
      color: 'bg-blue-500',
    },
    {
      icon: AlertTriangle,
      label: 'Critical Findings',
      value: securityData.criticalFindings,
      color: 'bg-red-500',
    },
    {
      icon: Eye,
      label: 'Publicly Exposed Assets',
      value: securityData.publicAssets.length,
      color: 'bg-orange-500',
    },
    {
      icon: Unlock,
      label: 'Unencrypted Resources',
      value: securityData.unencryptedAssets.length,
      color: 'bg-yellow-500',
    },
    {
      icon: FileWarning,
      label: 'Non-Compliant Assets',
      value: securityData.nonCompliantAssets,
      color: 'bg-purple-500',
    },
  ];

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security & Compliance
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Security posture based on live AWS inventory and security findings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className={`p-2 rounded-lg ${card.color} w-fit mb-3`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>

            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Findings by Severity
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={securityData.severityData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={gridStroke}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12,
                  fill: isDark ? '#94a3b8' : '#6b7280',
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 12,
                  fill: isDark ? '#94a3b8' : '#6b7280',
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow:
                    '0 4px 20px rgba(0,0,0,0.15)',
                }}
                cursor={false}
              />

              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                activeBar={false}
              >
                {securityData.severityData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Findings are loaded from the live security findings
            service backed by DynamoDB.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Inventory Security Status
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total AWS Assets
              </span>

              <span className="font-semibold text-gray-900 dark:text-white">
                {securityData.totalAssets}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Publicly Exposed
              </span>

              <span className="font-semibold text-orange-500">
                {securityData.publicAssets.length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Unencrypted
              </span>

              <span className="font-semibold text-yellow-500">
                {securityData.unencryptedAssets.length}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Critical Findings
              </span>

              <span className="font-semibold text-red-500">
                {securityData.criticalFindings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            AWS Resources by Service
          </h3>

          <div className="space-y-3">
            {securityData.assetsByService.map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-3"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                  {service.name}
                </span>

                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{
                      width: `${
                        securityData.totalAssets > 0
                          ? (service.count /
                              securityData.totalAssets) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                  {service.count}
                </span>
              </div>
            ))}

            {securityData.assetsByService.length === 0 && (
              <p className="text-sm text-gray-500">
                No inventory data available.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Security Findings
          </h3>

          <div className="flex gap-2">
            {['', 'Critical', 'High', 'Medium', 'Low'].map((severity) => (
              <button
                key={severity}
                onClick={() => setSeverityFilter(severity)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  severityFilter === severity
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {severity || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                {[
                  'Finding ID',
                  'Asset',
                  'Severity',
                  'Rule',
                  'Status',
                  'Detected',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredFindings.map((finding) => (
                <tr
                  key={finding.findingId}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-5 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                    {finding.findingId}
                  </td>

                  <td className="px-5 py-3 text-sm font-medium text-primary-600 dark:text-primary-400">
                    {finding.assetName || finding.assetId || finding.findingId}
                  </td>

                  <td className="px-5 py-3">
                    <Badge value={finding.severity} />
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {finding.rule}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium ${
                          finding.status === 'Open'
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}
                      >
                        {finding.status}
                      </span>

                      {finding.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => handleResolve(finding.findingId)}
                          disabled={resolvingId === finding.findingId}
                          className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-400"
                        >
                          {resolvingId === finding.findingId
                            ? 'Resolving...'
                            : 'Resolve'}
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(
                      finding.detectedAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {filteredFindings.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center"
                  >
                    <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />

                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      No security findings available
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      No security findings are currently stored
                      in the backend.
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
