import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assets, providers, services, regions, statuses, environments, owners } from '../data/mockData';
import SearchBar from '../components/common/SearchBar';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import { RefreshCw, Download, Plus, MoreVertical, Filter, X } from 'lucide-react';

export default function AssetInventoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ provider: '', service: '', region: '', status: '', environment: '', owner: '' });
  const perPage = 10;

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    let result = [...assets];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q) || a.resourceId.toLowerCase().includes(q) || Object.values(a.tags).some((t) => t.toLowerCase().includes(q)));
    }
    if (filters.provider) result = result.filter((a) => a.provider === filters.provider);
    if (filters.service) result = result.filter((a) => a.service === filters.service);
    if (filters.region) result = result.filter((a) => a.region === filters.region);
    if (filters.status) result = result.filter((a) => a.status === filters.status);
    if (filters.environment) result = result.filter((a) => a.environment === filters.environment);
    if (filters.owner) result = result.filter((a) => a.owner === filters.owner);
    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return result;
  }, [search, filters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => {
    if (selected.length === paginated.length) setSelected([]);
    else setSelected(paginated.map((a) => a.id));
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cloud Asset Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{filtered.length} assets found</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Account</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID, or tag..." className="flex-1" />
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${showFilters ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-900/20 dark:border-primary-700' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
          <Filter className="w-4 h-4" />
          Filters {activeFilterCount > 0 && <span className="bg-primary-500 text-white text-xs rounded-full px-1.5">{activeFilterCount}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Filters</h4>
            {activeFilterCount > 0 && (
              <button onClick={() => setFilters({ provider: '', service: '', region: '', status: '', environment: '', owner: '' })} className="text-xs text-primary-500 hover:text-primary-600">Clear all</button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: 'provider', label: 'Provider', options: providers },
              { key: 'service', label: 'Service', options: services },
              { key: 'region', label: 'Region', options: regions },
              { key: 'status', label: 'Status', options: statuses },
              { key: 'environment', label: 'Environment', options: environments },
              { key: 'owner', label: 'Owner', options: owners },
            ].map((f) => (
              <select key={f.key} value={filters[f.key]} onChange={(e) => setFilter(f.key, e.target.value)} className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                <option value="">All {f.label}s</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-primary-700 dark:text-primary-300">{selected.length} selected</span>
          <button onClick={() => setSelected([])} className="text-primary-600 hover:text-primary-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                </th>
                {[
                  { key: 'name', label: 'Asset Name' },
                  { key: 'resourceId', label: 'Resource ID' },
                  { key: 'type', label: 'Type' },
                  { key: 'provider', label: 'Provider' },
                  { key: 'region', label: 'Region' },
                  { key: 'environment', label: 'Environment' },
                  { key: 'owner', label: 'Owner' },
                  { key: 'status', label: 'Status' },
                  { key: 'lastScanned', label: 'Last Scanned' },
                ].map((col) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap">
                    {col.label} {sortField === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(asset.id)} onChange={() => toggleSelect(asset.id)} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => navigate(`/dashboard/assets/${asset.id}`)} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">{asset.name}</button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">{asset.resourceId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.provider}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.region}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.environment}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{asset.owner}</td>
                  <td className="px-4 py-3"><Badge value={asset.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(asset.lastScanned).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><MoreVertical className="w-4 h-4 text-gray-500" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
