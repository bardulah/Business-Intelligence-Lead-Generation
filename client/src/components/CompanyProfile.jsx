import React from 'react';

function CompanyProfile({ company }) {
  if (!company) return null;

  const {
    name,
    domain,
    description,
    industry,
    location,
    foundedYear,
    size,
    businessModel,
    features,
    socialProof,
    website
  } = company;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🏢 Company Profile
      </h3>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {industry && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Industry</div>
            <div className="font-medium text-gray-900">{industry}</div>
          </div>
        )}
        {location && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Location</div>
            <div className="font-medium text-gray-900">{location}</div>
          </div>
        )}
        {foundedYear && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Founded</div>
            <div className="font-medium text-gray-900">{foundedYear}</div>
          </div>
        )}
        {size && (
          <div>
            <div className="text-sm text-gray-600 mb-1">Company Size</div>
            <div className="font-medium text-gray-900">{size}</div>
          </div>
        )}
      </div>

      {/* Business Model */}
      {businessModel && businessModel.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            💼 Business Model
          </h4>
          <div className="flex flex-wrap gap-2">
            {businessModel.map((model, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Features/Services */}
      {features && features.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            ✨ Key Features & Services
          </h4>
          <ul className="space-y-1.5">
            {features.slice(0, 5).map((feature, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span className="flex-1">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Social Proof */}
      {socialProof && Object.keys(socialProof).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            🏆 Social Proof
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {socialProof.customers && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {parseInt(socialProof.customers).toLocaleString()}+
                </div>
                <div className="text-xs text-green-600">Customers</div>
              </div>
            )}
            {socialProof.testimonials && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {socialProof.testimonials}
                </div>
                <div className="text-xs text-blue-600">Testimonials</div>
              </div>
            )}
            {socialProof.awards && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {socialProof.awards}
                </div>
                <div className="text-xs text-yellow-600">Awards</div>
              </div>
            )}
            {socialProof.pressMentions && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {socialProof.pressMentions}
                </div>
                <div className="text-xs text-purple-600">Press Mentions</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Website Metadata */}
      {website && (website.title || website.keywords?.length > 0) && (
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            🌐 Website Information
          </h4>
          {website.title && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">Title: </span>
              <span className="text-sm text-gray-900">{website.title}</span>
            </div>
          )}
          {website.keywords && website.keywords.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">Keywords: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {website.keywords.slice(0, 10).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyProfile;
