import React, { useState } from 'react';
import axios from 'axios';

function ExportPanel({ leads }) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format) => {
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }

    setExporting(true);
    setShowMenu(false);

    try {
      const response = await axios.post(
        `/api/export/${format}`,
        { leads },
        {
          responseType: format === 'json' ? 'json' : 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(
        new Blob([format === 'json' ? JSON.stringify(response.data, null, 2) : response.data])
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export leads: ' + (error.response?.data?.error || error.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={leads.length === 0 || exporting}
        className="btn-primary flex items-center"
      >
        {exporting ? (
          <>
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
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
            Exporting...
          </>
        ) : (
          <>
            📥 Export ({leads.length})
          </>
        )}
      </button>

      {/* Export Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="mr-2">📊</span>
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="mr-2">📋</span>
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="mr-2">📄</span>
                Export as PDF
              </button>
            </div>

            <div className="border-t border-gray-200 py-1">
              <div className="px-4 py-2 text-xs text-gray-500">
                CRM Integration (Coming Soon)
              </div>
              <button
                disabled
                className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center"
              >
                <span className="mr-2">📧</span>
                Export to HubSpot
              </button>
              <button
                disabled
                className="w-full text-left px-4 py-2 text-sm text-gray-400 cursor-not-allowed flex items-center"
              >
                <span className="mr-2">💼</span>
                Export to Salesforce
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExportPanel;
