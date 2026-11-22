import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from './Icons';

export default function EmptyState({
  heading = 'No items found',
  description = 'Try exploring other categories or adjusting your filters.',
  actionText = 'Explore Marketplace',
  actionLink = '/marketplace',
  onAction,
  icon: CustomIcon,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-sm">
        {CustomIcon ? <CustomIcon className="w-8 h-8" /> : <SparklesIcon className="w-8 h-8" />}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
        {heading}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {description}
      </p>

      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary"
        >
          {actionText}
        </button>
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="btn btn-primary"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
}