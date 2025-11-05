import React from 'react';

function TechnologyStack({ technology }) {
  if (!technology || !technology.technologies) return null;

  const { technologies, confidence, summary } = technology;

  const categoryIcons = {
    frontend: '🎨',
    backend: '⚙️',
    analytics: '📊',
    hosting: '☁️',
    cms: '📝',
    ecommerce: '🛒',
    marketing: '📢',
    security: '🔒'
  };

  const categoryColors = {
    frontend: 'bg-purple-100 text-purple-700 border-purple-200',
    backend: 'bg-blue-100 text-blue-700 border-blue-200',
    analytics: 'bg-green-100 text-green-700 border-green-200',
    hosting: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    cms: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ecommerce: 'bg-pink-100 text-pink-700 border-pink-200',
    marketing: 'bg-orange-100 text-orange-700 border-orange-200',
    security: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🔧 Technology Stack
        </h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Detection Confidence:</span>
          <span className="font-semibold text-primary-600">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(technologies).map(([category, techs]) => {
          if (!Array.isArray(techs) || techs.length === 0) return null;

          return (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="mr-2">{categoryIcons[category] || '🔹'}</span>
                <span className="capitalize">{category}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({techs.length})
                </span>
              </h4>

              <div className="flex flex-wrap gap-2">
                {techs.map((tech, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                      categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {tech.name}
                    {tech.confidence && (
                      <span className="ml-1 text-xs opacity-75">
                        ({Math.round(tech.confidence * 100)}%)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {summary && summary.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            📋 Technology Summary
          </h4>
          <ul className="space-y-1">
            {summary.map((item, index) => (
              <li key={index} className="text-sm text-gray-600">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TechnologyStack;
