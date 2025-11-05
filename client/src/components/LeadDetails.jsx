import React from 'react';
import ScoreBreakdown from './ScoreBreakdown';
import TechnologyStack from './TechnologyStack';
import ContactInfo from './ContactInfo';
import CompanyProfile from './CompanyProfile';
import GitHubActivity from './GitHubActivity';

function LeadDetails({ lead }) {
  if (!lead) {
    return (
      <div className="card text-center py-20">
        <div className="text-6xl mb-4">👈</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Select a Lead
        </h3>
        <p className="text-gray-600">
          Choose a lead from the list to view detailed analysis
        </p>
      </div>
    );
  }

  const name = lead.company?.name || lead.github?.name || 'Unknown Lead';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>
            {lead.company?.description && (
              <p className="text-gray-600 mb-4">{lead.company.description}</p>
            )}
            {lead.github?.description && !lead.company?.description && (
              <p className="text-gray-600 mb-4">{lead.github.description}</p>
            )}

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              {lead.company?.domain && (
                <a
                  href={`https://${lead.company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
                >
                  🌐 Website
                </a>
              )}
              {lead.github?.url && (
                <a
                  href={lead.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  💻 GitHub
                </a>
              )}
              {lead.contact?.social?.linkedin && (
                <a
                  href={lead.contact.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  💼 LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <ScoreBreakdown scoring={lead.scoring} />

      {/* Company Profile */}
      {lead.company && <CompanyProfile company={lead.company} />}

      {/* GitHub Activity */}
      {lead.github && <GitHubActivity github={lead.github} />}

      {/* Technology Stack */}
      {lead.technology && <TechnologyStack technology={lead.technology} />}

      {/* Contact Information */}
      {lead.contact && <ContactInfo contact={lead.contact} />}
    </div>
  );
}

export default LeadDetails;
