import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function ScoreBreakdown({ scoring }) {
  if (!scoring) return null;

  const { totalScore, grade, priority, breakdown, reasoning, confidence } = scoring;

  const chartData = breakdown ? [
    { name: 'GitHub', score: breakdown.github, color: '#8b5cf6' },
    { name: 'Tech', score: breakdown.technology, color: '#3b82f6' },
    { name: 'Company', score: breakdown.company, color: '#10b981' },
    { name: 'Contact', score: breakdown.contact, color: '#f59e0b' },
    { name: 'Engage', score: breakdown.engagement, color: '#ef4444' }
  ] : [];

  const priorityConfig = {
    high: { color: 'text-red-600', bg: 'bg-red-100', label: '🔥 High Priority' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '⚡ Medium Priority' },
    low: { color: 'text-green-600', bg: 'bg-green-100', label: '✓ Low Priority' },
    'very-low': { color: 'text-gray-600', bg: 'bg-gray-100', label: '· Very Low Priority' }
  };

  const config = priorityConfig[priority] || priorityConfig['low'];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Lead Score Analysis
      </h3>

      {/* Overall Score */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary-600 mb-1">
            {totalScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Overall Score</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-1">{grade}</div>
          <div className="text-sm text-gray-600">Grade</div>
        </div>
        <div className="text-center">
          <div className={`text-4xl font-bold ${config.color} mb-1`}>
            {Math.round(confidence * 100)}%
          </div>
          <div className="text-sm text-gray-600">Confidence</div>
        </div>
      </div>

      {/* Priority Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Score Breakdown Chart */}
      {chartData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Score Components
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reasoning */}
      {reasoning && reasoning.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            🎯 Key Insights
          </h4>
          <ul className="space-y-2">
            {reasoning.map((reason, index) => (
              <li
                key={index}
                className="flex items-start text-sm text-gray-700"
              >
                <span className="text-primary-600 mr-2">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ScoreBreakdown;
