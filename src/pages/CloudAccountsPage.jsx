import { useState } from 'react';
import { cloudAccounts } from '../data/mockData';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { Cloud, RefreshCw, Link as LinkIcon, Eye, Edit, Plus, Loader2 } from 'lucide-react';

export default function CloudAccountsPage() {
  const [accounts, setAccounts] = useState(cloudAccounts);
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ provider: 'AWS', name: '', accessKey: '', region: 'us-east-1', scanFrequency: 'daily' });
  const [syncing, setSyncing] = useState(null);

  const handleSync = (id) => {
    setSyncing(id);
    setTimeout(() => setSyncing(null), 2000);
  };

  const handleConnect = () => {
    if (newAccount.name && newAccount.accessKey) {
      setAccounts((prev) => [...prev, {
        id: `acc-${Date.now()}`, name: newAccount.name, provider: newAccount.provider,
        accountId: Math.random().toString().slice(2, 14), status: 'connected',
        assetCount: 0, lastSync: new Date().toISOString(), regionCount: 1,
        defaultRegion: newAccount.region,
      }]);
      setShowModal(false);
      setNewAccount({ provider: 'AWS', name: '', accessKey: '', region: 'us-east-1', scanFrequency: 'daily' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cloud Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{accounts.length} accounts connected</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Connect Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${acc.provider === 'AWS' ? 'bg-orange-100 dark:bg-orange-900/30' : acc.provider === 'Azure' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <Cloud className={`w-5 h-5 ${acc.provider === 'AWS' ? 'text-orange-600' : acc.provider === 'Azure' ? 'text-blue-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{acc.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{acc.accountId}</p>
                </div>
              </div>
              <Badge value={acc.status} />
            </div>
            <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100 dark:border-gray-700/50">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{acc.assetCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Assets</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{acc.regionCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Regions</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(acc.lastSync).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
              <button onClick={() => handleSync(acc.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {syncing === acc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Sync
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Eye className="w-3 h-3" /> Assets
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Edit className="w-3 h-3" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Connect Cloud Account">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cloud Provider</label>
            <select value={newAccount.provider} onChange={(e) => setNewAccount((p) => ({ ...p, provider: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option>AWS</option><option>Azure</option><option>GCP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
            <input type="text" value={newAccount.name} onChange={(e) => setNewAccount((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="My Production Account" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Key / Connection String</label>
            <input type="password" value={newAccount.accessKey} onChange={(e) => setNewAccount((p) => ({ ...p, accessKey: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" placeholder="Enter credentials" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Region</label>
              <select value={newAccount.region} onChange={(e) => setNewAccount((p) => ({ ...p, region: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option>us-east-1</option><option>us-west-2</option><option>eu-west-1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scan Frequency</label>
              <select value={newAccount.scanFrequency} onChange={(e) => setNewAccount((p) => ({ ...p, scanFrequency: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                <option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={handleConnect} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Connect Account
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
