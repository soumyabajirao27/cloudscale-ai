import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load resource data',
  message = 'There was a connection or data synchronization problem with the cloud operations service.',
  onRetry
}) => {
  return (
    <div className="w-full bg-red-950/20 border border-red-900/50 rounded-xl p-8 text-center flex flex-col items-center justify-center my-6">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-red-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg font-medium text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Data Fetch</span>
        </button>
      )}
    </div>
  );
};
