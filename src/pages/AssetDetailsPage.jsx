import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Server,
  Database,
  Cloud,
  Network,
  Shield,
  Tag,
} from 'lucide-react';

import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { getAsset } from '../services/api';

function getAssetIcon(type) {
  switch (type) {
    case 'S3':
      return Database;
    case 'VPC':
      return Cloud;
    case 'SUBNET':
      return Network;
    case 'EC2':
      return Server;
    case 'Lambda':
      return Server;
    default:
      return Cloud;
  }
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function RelationshipSection({ asset }) {
  const relationships = [];

  if (asset.vpcId) {
    relationships.push(['VPC', asset.vpcId]);
  }

  if (asset.subnetId) {
    relationships.push(['Subnet', asset.subnetId]);
  }

  if (asset.securityGroups?.length) {
    asset.securityGroups.forEach((group) => {
      relationships.push([
        'Security Group',
        `${group.groupName || 'Unknown'} (${group.groupId || 'N/A'})`,
      ]);
    });
  }

  if (relationships.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        No relationship information available for this asset.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relationships.map(([label, value], index) => (
        <div
          key={`${label}-${value}-${index}`}
          className="flex items-center justify-between gap-4 text-sm py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
        >
          <span className="text-gray-500 dark:text-gray-400">
            {label}
          </span>

          <span className="font-medium text-gray-900 dark:text-white text-right font-mono">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AssetDetailsPage() {
  const { id } = useParams();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAsset();
  }, [id]);

  async function loadAsset() {
    try {
      setLoading(true);
      setError('');
      setAsset(null);

      const response = await getAsset(id);

      setAsset(response.asset || response.data || null);

      if (!response.asset && !response.data) {
        throw new Error('Asset was not found');
      }
    } catch (err) {
      console.error('Asset details error:', err);
      setError(err.message || 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  }

  const Icon = useMemo(
    () => getAssetIcon(asset?.assetType),
    [asset?.assetType]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          to="/dashboard/assets"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>

        <ErrorState message={error} />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-4">
        <Link
          to="/dashboard/assets"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center text-gray-500">
          Asset not found.
        </div>
      </div>
    );
  }

  const excludedFields = new Set([
    'assetId',
    'assetName',
    'assetType',
    'provider',
    'region',
    'status',
    'lastScanned',
    'tags',
    'securityGroups',
    'vpcId',
    'subnetId',
  ]);

  const configurationFields = Object.entries(asset).filter(
    ([key, value]) =>
      !excludedFields.has(key) &&
      value !== null &&
      value !== undefined &&
      value !== ''
  );

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/assets"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Inventory
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <Icon className="w-8 h-8 text-primary-500" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {asset.assetName || asset.assetId}
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                {asset.assetId}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge value={asset.status} />

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {asset.assetType}
                </span>

                <span className="text-xs text-gray-400">•</span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {asset.provider}
                </span>

                <span className="text-xs text-gray-400">•</span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {asset.region}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>
              Last scanned:{' '}
              {asset.lastScanned
                ? new Date(asset.lastScanned).toLocaleString()
                : 'N/A'}
            </p>

            {asset.creationDate && (
              <p className="mt-1">
                Created:{' '}
                {new Date(asset.creationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Asset Information
          </h3>

          <div className="space-y-3">
            {[
              ['Asset ID', asset.assetId],
              ['Asset Name', asset.assetName],
              ['Asset Type', asset.assetType],
              ['Provider', asset.provider],
              ['Region', asset.region],
              ['Status', asset.status],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 text-sm py-1"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {label}
                </span>

                <span className="font-medium text-gray-900 dark:text-white text-right">
                  {label === 'Status' ? (
                    <Badge value={value} />
                  ) : (
                    formatValue(value)
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            AWS Configuration
          </h3>

          <div className="space-y-3">
            {configurationFields.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No additional configuration data available.
              </p>
            ) : (
              configurationFields.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between gap-4 text-sm py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                >
                  <span className="text-gray-500 dark:text-gray-400 capitalize">
                    {formatLabel(key)}
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white text-right max-w-[60%] break-words">
                    {Array.isArray(value)
                      ? value.map((item) => (
                          <span
                            key={item.groupId || JSON.stringify(item)}
                            className="block"
                          >
                            {typeof item === 'object'
                              ? `${item.groupName || ''} ${
                                  item.groupId || ''
                                }`
                              : String(item)}
                          </span>
                        ))
                      : formatValue(value)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Relationships */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Network className="w-4 h-4" />
            Relationships
          </h3>

          <RelationshipSection asset={asset} />
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Information
          </h3>

          <div className="space-y-3">
            {asset.encryption && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Encryption
                </span>

                <span className="font-medium text-gray-900 dark:text-white">
                  {asset.encryption}
                </span>
              </div>
            )}

            {asset.publicAccess && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Public Access
                </span>

                <span
                  className={`font-medium ${
                    asset.publicAccess === 'Public'
                      ? 'text-red-500'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {asset.publicAccess}
                </span>
              </div>
            )}

            {!asset.encryption && !asset.publicAccess && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No security-specific information is available for this asset.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags
        </h3>

        {asset.tags && Object.keys(asset.tags).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(asset.tags).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {key}: {value}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tags configured.
          </p>
        )}
      </div>

      {/* Scan information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Discovery Information
        </h3>

        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Last discovered by AWS inventory scan:
          </span>

          <span className="ml-2 font-medium text-gray-900 dark:text-white">
            {asset.lastScanned
              ? new Date(asset.lastScanned).toLocaleString()
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}
