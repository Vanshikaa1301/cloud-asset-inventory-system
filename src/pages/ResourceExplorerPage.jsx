import { useState, useMemo } from 'react';
import { resourceTree, assets } from '../data/mockData';
import Badge from '../components/common/Badge';
import SearchBar from '../components/common/SearchBar';
import { ChevronRight, ChevronDown, FolderTree, Server, Database, Cloud, Shield } from 'lucide-react';

function TreeNode({ node, depth = 0, selected, onSelect, searchQuery }) {
  const [expanded, setExpanded] = useState(depth < 2 || !!searchQuery);
  const hasChildren = node.children && node.children.length > 0;
  const iconMap = { account: Cloud, service: FolderTree, 'EC2 Instance': Server, 'S3 Bucket': Database, 'RDS Database': Database, 'Lambda Function': Server, 'VPC': Cloud, 'IAM Role': Shield, 'Security Group': Shield, 'Load Balancer': Server, 'Network Interface': Server };
  const Icon = iconMap[node.type] || FolderTree;

  const matchesSearch = (n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (n.name.toLowerCase().includes(q)) return true;
    if (n.children) return n.children.some((c) => matchesSearch(c));
    return false;
  };

  if (!matchesSearch(node)) return null;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm ${selected === node.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => { if (hasChildren) setExpanded(!expanded); onSelect(node); }}
      >
        {hasChildren ? (expanded ? <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" /> : <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />) : <span className="w-4" />}
        <Icon className="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400" />
        <span className="truncate flex-1">{node.name}</span>
        {node.status && <Badge value={node.status} />}
      </div>
      {expanded && hasChildren && node.children.map((child) => (
        <TreeNode key={child.name + child.id} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

export default function ResourceExplorerPage() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState('');
  const detailAsset = selectedNode?.id ? assets.find((a) => a.id === selectedNode.id) : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Explorer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse and explore cloud resources</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-stretch">
        <div className="w-full lg:w-1/2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <SearchBar value={search} onChange={setSearch} placeholder="Search resources..." />
          </div>
          <div className="p-3 flex-1 overflow-y-auto">
            <TreeNode node={resourceTree} selected={selectedNode?.id} onSelect={setSelectedNode} searchQuery={search} />
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col">
          {detailAsset ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex-1">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <Server className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{detailAsset.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{detailAsset.resourceId}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  ['Type', detailAsset.type],
                  ['Provider', detailAsset.provider],
                  ['Region', detailAsset.region],
                  ['Status', detailAsset.status],
                  ['Environment', detailAsset.environment],
                  ['Owner', detailAsset.owner],
                  ['Created', new Date(detailAsset.creationDate).toLocaleDateString()],
                  ['Last Scanned', new Date(detailAsset.lastScanned).toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">{k}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{k === 'Status' ? <Badge value={v} /> : v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center flex-1 flex flex-col items-center justify-center">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Select a resource to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
