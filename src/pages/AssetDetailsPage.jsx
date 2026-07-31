import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assets, activityLogs, costTrendData } from '../data/mockData';
import Badge from '../components/common/Badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, GitBranch, Clock, DollarSign, Tag, Server } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const tabs = ['Overview', 'Security', 'Relationships', 'Activity', 'Cost'];

function RelationshipDiagram({ asset }) {
  const relations = {
    'EC2 Instance': ['Security Group → sg-web-prod', 'VPC → vpc-prod-main', 'Subnet → subnet-001', 'ENI → eni-0abc123def456789'],
    'S3 Bucket': ['IAM Role → S3-FullAccess', 'Application → Backend Service', 'VPC Endpoint → vpce-abc'],
    'RDS Database': ['VPC → vpc-prod-main', 'Subnet Group → prod-db-subnets', 'Security Group → sg-db-prod', 'IAM Role → RDS-Monitoring'],
    'Lambda Function': ['VPC → vpc-prod-main', 'IAM Role → Lambda-Execution', 'CloudWatch Logs → /aws/lambda/payment-processing', 'Event Source → API Gateway'],
    'VPC': ['Subnets × 8', 'Route Tables × 4', 'Internet Gateway → igw-abc', 'NAT Gateway × 2'],
    'IAM Role': ['Attached Instances × 3', 'Managed Policies × 3', 'Inline Policies × 1'],
    'Security Group': ['VPC → vpc-prod-main', 'Attached Instances × 5'],
    'Load Balancer': ['Target Groups × 3', 'SSL Certificates × 2', 'VPC → vpc-prod-main', 'WAF → waf-prod'],
    'Network Interface': ['Instance → production-web-server', 'Subnet → subnet-001', 'Security Group → sg-web-prod'],
  };
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Resource Relationships</h4>
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-2">
        <div className="text-primary-600 dark:text-primary-400 font-semibold">{asset.name}</div>
        {(relations[asset.type] || []).map((rel, i) => (
          <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 pl-4">
            <GitBranch className="w-3 h-3 flex-shrink-0" />
            <span>{rel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssetDetailsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#e5e7eb';
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const asset = assets.find((a) => a.id === id) || assets[0];

  return (
    <div className="space-y-6">
        <Link to="/dashboard/assets" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="w-4 h-4" /> Back to Inventory
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <Server className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{asset.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">{asset.resourceId}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge value={asset.status} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{asset.type}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{asset.provider}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{asset.region}</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Last discovered: {new Date(asset.lastScanned).toLocaleString()}</p>
            <p>Created: {new Date(asset.creationDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Asset Information</h3>
            <div className="space-y-3">
              {[
                ['Owner', asset.owner],
                ['Environment', asset.environment],
                ['Provider', asset.provider],
                ['Region', asset.region],
                ['Created', new Date(asset.creationDate).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Configuration Details</h3>
            <div className="space-y-3">
              {Object.entries(asset.config).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(asset.tags).map(([k, v]) => (
                <span key={k} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Security Status</h3>
            <div className="space-y-4">
              {[
                ['Encryption', asset.security.encrypted, asset.security.encrypted ? 'Encrypted' : 'Not Encrypted'],
                ['Public Access', asset.security.publicAccess, asset.security.publicAccess ? 'Publicly Accessible' : 'Private'],
                ['Compliance Score', true, `${asset.security.complianceScore}%`],
              ].map(([label, ok, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                  <span className={`text-sm font-medium ${ok ? (label === 'Public Access' && asset.security.publicAccess ? 'text-red-500' : 'text-green-600 dark:text-green-400') : 'text-red-500'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Compliance Checks</h3>
            <div className="space-y-3">
              {['Encryption at rest enabled', 'Access logging configured', 'Network isolation verified', 'Backup retention policy'].map((check, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Relationships' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <RelationshipDiagram asset={asset} />
        </div>
      )}

      {activeTab === 'Activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Activity Timeline</h3>
          <div className="space-y-4">
            {activityLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{log.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{log.resource} • {log.user} • {new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Cost' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Estimated Monthly Cost</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-3">${asset.cost.monthly.toLocaleString()}/mo</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Cost Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#6b7280' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [`$${v}`, 'Cost']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} cursor={false} />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
