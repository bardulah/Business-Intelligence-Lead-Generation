import React, { useState } from 'react';

function ContactInfo({ contact }) {
  const [copiedEmail, setCopiedEmail] = useState(null);

  if (!contact) return null;

  const { emails, phones, social, confidence } = contact;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(index);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const emailTypeIcons = {
    sales: '💼',
    general: '📧',
    support: '🛟',
    personal: '👤',
    admin: '⚙️',
    unknown: '📮'
  };

  const emailTypeColors = {
    sales: 'bg-green-100 text-green-700',
    general: 'bg-blue-100 text-blue-700',
    support: 'bg-yellow-100 text-yellow-700',
    personal: 'bg-purple-100 text-purple-700',
    admin: 'bg-gray-100 text-gray-700',
    unknown: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📇 Contact Information
        </h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Data Confidence:</span>
          <span className="font-semibold text-primary-600">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Emails */}
      {emails && emails.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            📧 Email Addresses ({emails.length})
          </h4>
          <div className="space-y-2">
            {emails.map((emailObj, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <span className="mr-2">{emailTypeIcons[emailObj.type] || '📧'}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {emailObj.email}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${emailTypeColors[emailObj.type]}`}>
                        {emailObj.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(emailObj.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(emailObj.email, index)}
                  className="ml-2 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  {copiedEmail === index ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phones */}
      {phones && phones.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            📞 Phone Numbers ({phones.length})
          </h4>
          <div className="space-y-2">
            {phones.map((phone, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="mr-2">📞</span>
                  <span className="font-medium text-gray-900">{phone}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(phone, `phone-${index}`)}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Media */}
      {social && Object.keys(social).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            🌐 Social Media ({Object.keys(social).length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(social).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="mr-2 text-xl">
                  {platform === 'twitter' && '𝕏'}
                  {platform === 'linkedin' && '💼'}
                  {platform === 'facebook' && '📘'}
                  {platform === 'instagram' && '📷'}
                  {platform === 'github' && '💻'}
                  {platform === 'youtube' && '📺'}
                </span>
                <span className="font-medium text-gray-900 capitalize">
                  {platform}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* No contacts found */}
      {(!emails || emails.length === 0) &&
       (!phones || phones.length === 0) &&
       (!social || Object.keys(social).length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🔍</div>
          <p>No contact information found</p>
        </div>
      )}
    </div>
  );
}

export default ContactInfo;
