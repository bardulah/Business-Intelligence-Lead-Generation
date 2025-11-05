import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function GitHubActivity({ github }) {
  if (!github) return null;

  const {
    fullName,
    stars,
    forks,
    watchers,
    openIssues,
    language,
    topics,
    contributors,
    analysis,
    license,
    createdAt,
    updatedAt,
    pushedAt
  } = github;

  const stats = [
    { label: 'Stars', value: stars?.toLocaleString() || 0, icon: '⭐', color: 'text-yellow-600' },
    { label: 'Forks', value: forks?.toLocaleString() || 0, icon: '🔱', color: 'text-blue-600' },
    { label: 'Watchers', value: watchers?.toLocaleString() || 0, icon: '👁️', color: 'text-green-600' },
    { label: 'Issues', value: openIssues?.toLocaleString() || 0, icon: '🐛', color: 'text-red-600' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💻 GitHub Activity
      </h3>

      {/* Repository Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.icon} {stat.value}
            </div>
            <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity Indicators */}
      {analysis && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Activity Score</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analysis.activityScore * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(analysis.activityScore * 100)}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Popularity Score</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${analysis.popularityScore * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(analysis.popularityScore * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {analysis.isActive && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                ✓ Active Development
              </span>
            )}
            {analysis.isPopular && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                🔥 Popular Project
              </span>
            )}
            {analysis.teamSize && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                👥 {analysis.teamSize} Contributors
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tech Stack */}
      {(language || (topics && topics.length > 0)) && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            🔧 Technology
          </h4>
          <div className="flex flex-wrap gap-2">
            {language && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {language}
              </span>
            )}
            {topics && topics.slice(0, 8).map((topic, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contributors */}
      {contributors && contributors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            👥 Top Contributors ({contributors.length})
          </h4>
          <div className="space-y-2">
            {contributors.slice(0, 5).map((contributor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <img
                    src={contributor.avatar}
                    alt={contributor.username}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <a
                    href={contributor.profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-900 hover:text-primary-600"
                  >
                    {contributor.username}
                  </a>
                </div>
                <span className="text-sm text-gray-600">
                  {contributor.contributions} commits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          📅 Repository Timeline
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span className="font-medium text-gray-900">{formatDate(createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Updated:</span>
            <span className="font-medium text-gray-900">{formatDate(updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Push:</span>
            <span className="font-medium text-gray-900">{formatDate(pushedAt)}</span>
          </div>
          {license && (
            <div className="flex justify-between">
              <span className="text-gray-600">License:</span>
              <span className="font-medium text-gray-900">{license}</span>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {analysis?.insights && analysis.insights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            💡 Key Insights
          </h4>
          <ul className="space-y-1.5">
            {analysis.insights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GitHubActivity;
