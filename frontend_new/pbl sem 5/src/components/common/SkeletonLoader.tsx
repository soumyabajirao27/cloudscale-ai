import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'chart' | 'text';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full animate-pulse space-y-3 bg-[#0f172a] p-4 rounded-xl border border-slate-800">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/60 rounded flex items-center px-4 space-x-4">
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-700 rounded w-1/6"></div>
            <div className="h-4 bg-slate-700 rounded w-1/5"></div>
            <div className="h-4 bg-slate-700 rounded w-1/8"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="w-full h-72 animate-pulse bg-[#0f172a] p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-slate-800 rounded w-1/3"></div>
          <div className="h-5 bg-slate-800 rounded w-1/6"></div>
        </div>
        <div className="h-44 bg-slate-800/50 rounded flex items-end justify-between p-4 space-x-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-700/60 rounded-t w-full"
              style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((_, i) => (
        <div key={i} className="animate-pulse bg-[#0f172a] p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          <div className="h-8 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-800 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
};
