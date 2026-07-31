const colorMap = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  connected: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Stopped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  disconnected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  syncing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Unknown: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Info: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function Badge({ value }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || colorMap.Unknown}`}>
      {value}
    </span>
  );
}
