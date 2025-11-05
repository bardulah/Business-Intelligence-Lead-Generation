import React from 'react';
import LeadCard from './LeadCard';

function LeadList({ leads, selectedLead, onSelectLead, loading }) {
  if (loading && leads.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Discovering leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Leads Yet
        </h3>
        <p className="text-gray-600">
          Start by analyzing a GitHub repository or website above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Discovered Leads ({leads.length})
        </h2>
      </div>

      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {leads.map((lead, index) => (
          <LeadCard
            key={index}
            lead={lead}
            isSelected={selectedLead === lead}
            onClick={() => onSelectLead(lead)}
          />
        ))}
      </div>
    </div>
  );
}

export default LeadList;
