import { AlertTriangle } from 'lucide-react';

export default function EmptyState({ icon: Icon = AlertTriangle, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
