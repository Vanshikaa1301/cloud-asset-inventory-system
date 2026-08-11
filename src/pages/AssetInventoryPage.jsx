import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { providers, services, regions, statuses, environments, owners } from '../data/mockData';
import { getInventory, scanAllAssets } from '../services/api';
import SearchBar from '../components/common/SearchBar';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import { RefreshCw, Download, Plus, MoreVertical, Filter, X } from 'lucide-react';

function mapAsset(asset) {
  return {
    ...asset,
    id: asset.assetId,
    name: asset.assetName || asset.assetId,
    resourceId: asset.assetId,
    type: asset.assetType,
    service: asset.assetType,
    provider: asset.provider || 'AWS',
    region: asset.region || 'Global',
    environment: asset.environment || 'Production',
    owner: asset.owner || asset.ownerId || 'AWS Account',
    status: asset.status || 'Unknown',
    tags: asset.tags || {},
    lastScanned: asset.lastScanned,
  };
}

export default function AssetInventoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    provider: '',
    service: '',
    region: '',
    status: '',
    environment: '',
    owner: '',
  });

  const perPage = 10;

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getInventory();

      if (response.success) {
        setAssets((response.assets || []).map(mapAsset));
      } else {
        throw new Error(response.message || 'Failed to load inventory');
      }
    } catch (err) {
      console.error('Inventory error:', err);
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleScan = async () => {
    try {
      setScanning(true);
      setError('');

      const response = await scanAllAssets();

      if (!response.success) {
        throw new Error(response.message || 'Scan failed');
      }

      await loadInventory();
      setPage(1);
      setSelected([]);
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Full asset scan failed');
    } finally {
      setScanning(false);
    }
  };

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = [...assets];

    if (search) {
      const q = search.toLowerCase();

      result = result.filter((a) =>
        String(a.name).toLowerCase().includes(q) ||
        String(a.resourceId).toLowerCase().includes(q) ||
        Object.values(a.tags || {}).some((t) =>
          String(t).toLowerCase().includes(q)
        )
      );
    }

    if (filters.provider) {
      result = result.filter((a) => a.provider === filters.provider);
    }

    if (filters.service) {
      result = result.filter((a) => a.service === filters.service);
    }

    if (filters.region) {
      result = result.filter((a) => a.region === filters.region);
    }

    if (filters.status) {
      result = result.filter(
        (a) => String(a.status).toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.environment) {
      result = result.filter((a) => a.environment === filters.environment);
    }

    if (filters.owner) {
      result = result.filter((a) => a.owner === filters.owner);
    }

    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';

      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [assets, search, filters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);

  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === paginated.length) {
      setSelected([]);
    } else {
      setSelected(paginated.map((a) => a.id));
    }
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      provider: '',
      service: '',
      region: '',
      status: '',
      environment: '',
      owner: '',
    });
    setPage(1);
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cloud Asset Inventory
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {loading ? 'Loading assets...' : `${filtered.length} assets found`}
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />

            <span className="hidden sm:inline">
              {scanning ? 'Scanning...' : 'Refresh'}
            </span>
          </button>

          <button
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Account</span>
          </button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name, ID, or tag..."
          className="flex-1"
        />

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
            showFilters
              ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-900/20 dark:border-primary-700'
              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />

          Filters

          {activeFilterCount > 0 && (
            <span className="bg-primary-500 text-white text-xs rounded-full px-1.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Filters
            </h4>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary-500 hover:text-primary-600"
              >
                Clear all
              </button>
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
              <select
                key={f.key}
                value={filters[f.key]}
                onChange={(e) => setFilter(f.key, e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="">All {f.label}s</option>

                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ))}

          </div>
        </div>
      )}

      {/* Selected */}
      {selected.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg px-4 py-2 flex items-center justify-between">

          <span className="text-sm text-primary-700 dark:text-primary-300">
            {selected.length} selected
          </span>

          <button
            onClick={() => setSelected([])}
            className="text-primary-600 hover:text-primary-700"
          >
            <X className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">

                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selected.length === paginated.length &&
                      paginated.length > 0
                    }
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
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
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap"
                  >
                    {col.label}{' '}
                    {sortField === col.key
                      ? sortDir === 'asc'
                        ? '↑'
                        : '↓'
                      : ''}
                  </th>
                ))}

                <th className="w-10 px-4 py-3"></th>

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    Loading AWS assets...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    No assets found.
                  </td>
                </tr>
              ) : (
                paginated.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >

                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(asset.id)}
                        onChange={() => toggleSelect(asset.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/assets/${asset.id}`)
                        }
                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {asset.name}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {asset.resourceId}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {asset.type}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {asset.provider}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {asset.region}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {asset.environment}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {asset.owner}
                    </td>

                    <td className="px-4 py-3">
                      <Badge value={asset.status} />
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {asset.lastScanned
                        ? new Date(asset.lastScanned).toLocaleDateString()
                        : '-'}
                    </td>

                    <td className="px-4 py-3">
                      <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length === 0
              ? 'Showing 0 of 0'
              : `Showing ${(page - 1) * perPage + 1}-${Math.min(
                  page * perPage,
                  filtered.length
                )} of ${filtered.length}`}
          </p>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />

        </div>

      </div>
    </div>
  );
}
