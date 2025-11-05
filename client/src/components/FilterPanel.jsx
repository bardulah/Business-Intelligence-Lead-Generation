import React from 'react';

function FilterPanel({ filters, setFilters }) {
  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🎚️ Filters & Sorting</h3>
        <button
          onClick={() => setFilters({ minScore: 0, priority: 'all', sortBy: 'score' })}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Minimum Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Score: {filters.minScore}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minScore}
            onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority Level
          </label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full input"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium Priority</option>
            <option value="low">✓ Low Priority</option>
            <option value="very-low">· Very Low Priority</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="w-full input"
          >
            <option value="score">Highest Score</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
