import React, { useState } from 'react';

function SearchBar({ onAnalyze, onSearch, loading }) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('analyze'); // 'analyze' or 'search'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (mode === 'analyze') {
      onAnalyze(input.trim());
    } else {
      onSearch(input.trim());
    }
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discovery Mode
          </label>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setMode('analyze')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'analyze'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎯 Analyze Single Lead
            </button>
            <button
              type="button"
              onClick={() => setMode('search')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'search'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔍 Search GitHub
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'analyze'
                ? 'Enter GitHub repo (owner/repo) or website URL...'
                : 'Search GitHub repositories...'
            }
            className="flex-1 input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : mode === 'analyze' ? (
              '🔎 Analyze'
            ) : (
              '🔍 Search'
            )}
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>
            <strong>Analyze examples:</strong> facebook/react, microsoft/vscode, example.com
          </div>
          <div>
            <strong>Search examples:</strong> react framework, ai tools, machine learning
          </div>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
