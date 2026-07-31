import { useState } from 'react';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';

const reports = [
  { id: 'r1', name: 'Complete Asset Inventory Report', description: 'Full inventory of all cloud assets across accounts and regions.', lastGenerated: '2026-07-30T10:00:00Z' },
  { id: 'r2', name: 'Security Compliance Report', description: 'Security findings, compliance scores, and remediation status.', lastGenerated: '2026-07-29T08:00:00Z' },
  { id: 'r3', name: 'Unused Resource Report', description: 'Identifies idle, stopped, or unattached resources for cost optimization.', lastGenerated: '2026-07-28T12:00:00Z' },
  { id: 'r4', name: 'Cloud Asset Cost Report', description: 'Cost breakdown by service, account, region, and environment.', lastGenerated: '2026-07-27T09:00:00Z' },
  { id: 'r5', name: 'Asset Change Report', description: 'Tracks all changes and modifications to cloud resources.', lastGenerated: '2026-07-26T14:00:00Z' },
];

export default function ReportsPage() {
  const [generating, setGenerating] = useState(null);

  const handleGenerate = (id) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Generate and download reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg w-fit mb-4">
              <FileText className="w-5 h-5 text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{report.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{report.description}</p>
            <p className="text-xs text-gray-400 mb-4">Last generated: {new Date(report.lastGenerated).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button onClick={() => handleGenerate(report.id)} disabled={generating === report.id} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60">
                {generating === report.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                Generate
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
