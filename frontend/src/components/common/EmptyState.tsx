import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No resources found',
  message = 'No infrastructure resources matched your search filter or selected parameters.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center my-6">
      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg font-medium text-sm transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
