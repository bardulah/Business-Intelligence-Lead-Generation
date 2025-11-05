import React from 'react';

function LeadCard({ lead, isSelected, onClick }) {
  const name = lead.company?.name || lead.github?.name || 'Unknown Lead';
  const score = lead.scoring?.totalScore || 0;
  const grade = lead.scoring?.grade || 'N/A';
  const priority = lead.scoring?.priority || 'low';
  const confidence = lead.scoring?.confidence || 0;

  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-green-500 bg-green-50',
    'very-low': 'border-gray-500 bg-gray-50'
  };

  const gradeColors = {
    'A+': 'text-green-700',
    'A': 'text-green-600',
    'B+': 'text-blue-600',
    'B': 'text-blue-500',
    'C+': 'text-yellow-600',
    'C': 'text-yellow-500',
    'D': 'text-red-500'
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-l-4 rounded-lg p-4 transition-all duration-200 ${
        priorityColors[priority] || 'border-gray-300 bg-white'
      } ${
        isSelected
          ? 'ring-2 ring-primary-500 shadow-lg'
          : 'hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {lead.company?.domain && (
            <p className="text-xs text-gray-600 truncate">
              {lead.company.domain}
            </p>
          )}
        </div>
        <div className="ml-2 text-right">
          <div className={`text-2xl font-bold ${gradeColors[grade] || 'text-gray-600'}`}>
            {grade}
          </div>
          <div className="text-xs text-gray-600">{score.toFixed(0)}/100</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {lead.company?.industry && (
          <span className="badge badge-info text-xs">
            {lead.company.industry}
          </span>
        )}
        {priority === 'high' && (
          <span className="badge badge-high text-xs">High Priority</span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {lead.github?.stars !== undefined && (
          <div className="flex items-center text-gray-600">
            ⭐ {lead.github.stars.toLocaleString()}
          </div>
        )}
        {lead.contact?.emails?.length > 0 && (
          <div className="flex items-center text-gray-600">
            📧 {lead.contact.emails.length} contacts
          </div>
        )}
        {lead.technology?.technologies && (
          <div className="flex items-center text-gray-600 col-span-2">
            🔧 {Object.values(lead.technology.technologies)
              .flat()
              .filter(t => t.name)
              .slice(0, 2)
              .map(t => t.name)
              .join(', ')}
          </div>
        )}
      </div>

      {/* Confidence Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Confidence</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default LeadCard;
