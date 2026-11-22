import React, { useState } from 'react';
import { SearchIcon, CloseIcon, FilterIcon } from './Icons';

export default function SearchFilterBar({
  placeholder = 'Search artworks, styles, or artists...',
  filterOptions = [],
  selectedFilter = '',
  onSearch,
  onFilter,
}) {
  const [query, setQuery] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (onSearch) onSearch(query);
  }

  function handleClear() {
    setQuery('');
    if (onSearch) onSearch('');
  }

  return (
    <form
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-4xl mx-auto mb-8"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 shadow-sm transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onSearch && e.target.value === '') {
              onSearch('');
            }
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {filterOptions.length > 0 && (
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FilterIcon className="w-3.5 h-3.5" />
            </div>
            <select
              className="w-full sm:w-auto pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-600 shadow-sm appearance-none cursor-pointer"
              value={selectedFilter}
              onChange={(e) => onFilter && onFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary py-3 px-5 shadow-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}
