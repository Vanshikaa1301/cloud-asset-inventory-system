import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Server,
  Database,
  Cloud,
  Shield,
} from 'lucide-react';

import Badge from '../components/common/Badge';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { getInventory } from '../services/api';

function TreeNode({
  node,
  depth = 0,
  selected,
  onSelect,
  searchQuery,
}) {
  const [expanded, setExpanded] = useState(depth < 2 || !!searchQuery);

  const hasChildren = node.children && node.children.length > 0;

  const iconMap = {
    account: Cloud,
    service: FolderTree,
    EC2: Server,
    S3: Database,
    Lambda: Server,
    VPC: Cloud,
    SUBNET: Cloud,
  };

  const Icon = iconMap[node.type] || FolderTree;

  const matchesSearch = (n) => {
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();

    if (n.name?.toLowerCase().includes(q)) return true;
    if (n.id?.toLowerCase().includes(q)) return true;

    if (n.children) {
      return n.children.some((child) => matchesSearch(child));
    }

    return false;
  };

  if (!matchesSearch(node)) return null;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer
        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm
        ${
          selected === node.id
            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
            : 'text-gray-700 dark:text-gray-300'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          }

          onSelect(node);
        }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
          )
        ) : (
          <span className="w-4" />
        )}

        <Icon className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />

        <span className="truncate flex-1">
          {node.name}
        </span>

        {node.status && <Badge value={node.status} />}
      </div>

      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selected={selected}
            onSelect={onSelect}
            searchQuery={searchQuery}
          />
        ))}
    </div>
  );
}

export default function ResourceExplorerPage() {
  const [assets, setAssets] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    try {
      setLoading(true);
      setError('');

      const response = await getInventory();

      setAssets(response.assets || []);
    } catch (err) {
      console.error('Resource Explorer error:', err);
      setError(err.message || 'Failed to load AWS resources');
    } finally {
      setLoading(false);
    }
  }

  const resourceTree = useMemo(() => {
    const services = {};

    assets.forEach((asset) => {
      const type = asset.assetType || 'Unknown';

      if (!services[type]) {
        services[type] = {
          id: `service-${type}`,
          name: type,
          type: 'service',
          children: [],
        };
      }

      services[type].children.push({
        id: asset.assetId,
        name: asset.assetName || asset.assetId,
        type,
        status: asset.status,
        asset,
      });
    });

    return {
      id: 'aws-account',
      name: 'AWS Account',
      type: 'account',
      children: Object.values(services),
    };
  }, [assets]);

  const detailAsset = selectedNode?.asset || null;

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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Resource Explorer
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Browse and explore your live AWS resources
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        {/* Resource Tree */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search AWS resources..."
            />
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            {resourceTree.children.length > 0 ? (
              <TreeNode
                node={resourceTree}
                selected={selectedNode?.id}
                onSelect={setSelectedNode}
                searchQuery={search}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">
                No AWS resources found.
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {detailAsset ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex-1">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  {detailAsset.assetType === 'S3' ? (
                    <Database className="w-6 h-6 text-primary-500" />
                  ) : detailAsset.assetType === 'VPC' ||
                    detailAsset.assetType === 'SUBNET' ? (
                    <Cloud className="w-6 h-6 text-primary-500" />
                  ) : (
                    <Server className="w-6 h-6 text-primary-500" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {detailAsset.assetName || detailAsset.assetId}
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {detailAsset.assetId}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ['Type', detailAsset.assetType],
                  ['Provider', detailAsset.provider],
                  ['Region', detailAsset.region],
                  ['Status', detailAsset.status],
                  ['Asset ID', detailAsset.assetId],
                  ['Last Scanned', detailAsset.lastScanned],
                ].map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-4 text-sm py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {key}
                    </span>

                    <span className="font-medium text-gray-900 dark:text-white text-right">
                      {key === 'Status' ? (
                        <Badge value={value} />
                      ) : key === 'Last Scanned' && value ? (
                        new Date(value).toLocaleString()
                      ) : (
                        value || 'N/A'
                      )}
                    </span>
                  </div>
                ))}

                {detailAsset.assetType === 'EC2' && (
                  <>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400">
                        Instance Type
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailAsset.instanceType || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400">
                        Private IP
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailAsset.privateIp || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm py-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Public IP
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailAsset.publicIp || 'N/A'}
                      </span>
                    </div>
                  </>
                )}

                {detailAsset.assetType === 'S3' && (
                  <>
                    <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700/50">
                      <span className="text-gray-500 dark:text-gray-400">
                        Versioning
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailAsset.versioning || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm py-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Encryption
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailAsset.encryption || 'N/A'}
                      </span>
                    </div>
                  </>
                )}

                {(detailAsset.assetType === 'VPC' ||
                  detailAsset.assetType === 'SUBNET') && (
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      CIDR Block
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {detailAsset.cidrBlock || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center flex-1 flex flex-col items-center justify-center">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />

              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Select a resource to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
