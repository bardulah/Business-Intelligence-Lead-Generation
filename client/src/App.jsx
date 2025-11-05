import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import LeadList from './components/LeadList';
import LeadDetails from './components/LeadDetails';
import FilterPanel from './components/FilterPanel';
import ExportPanel from './components/ExportPanel';
import axios from 'axios';

function App() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minScore: 0,
    priority: 'all',
    sortBy: 'score'
  });

  const analyzeLead = async (input) => {
    setLoading(true);
    try {
      const isGithub = input.includes('github.com') || input.includes('/');
      const payload = {};

      if (isGithub) {
        // Extract owner/repo from GitHub URL or handle
        const match = input.match(/github\.com\/([^\/]+\/[^\/]+)/) || input.match(/^([^\/]+\/[^\/]+)$/);
        if (match) {
          payload.github = match[1];
        }
      } else {
        payload.website = input;
      }

      const response = await axios.post('/api/leads/analyze', payload);
      const newLead = response.data;

      setLeads(prev => {
        const exists = prev.find(l =>
          l.metadata?.url === newLead.metadata?.url ||
          l.github?.fullName === newLead.github?.fullName
        );
        if (exists) {
          return prev.map(l =>
            (l.metadata?.url === newLead.metadata?.url ||
             l.github?.fullName === newLead.github?.fullName) ? newLead : l
          );
        }
        return [newLead, ...prev];
      });

      setSelectedLead(newLead);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze lead: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const searchGitHub = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/github/search', {
        params: { q: query, limit: 10 }
      });

      const repos = response.data.results;
      const analyzedLeads = [];

      for (const repo of repos.slice(0, 5)) {
        try {
          const leadResponse = await axios.post('/api/leads/analyze', {
            github: repo.fullName,
            website: repo.homepage
          });
          analyzedLeads.push(leadResponse.data);
        } catch (error) {
          console.error('Error analyzing repo:', error);
        }
      }

      setLeads(analyzedLeads);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search GitHub: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const score = lead.scoring?.totalScore || 0;
    const priority = lead.scoring?.priority || '';

    if (score < filters.minScore) return false;
    if (filters.priority !== 'all' && priority !== filters.priority) return false;

    return true;
  }).sort((a, b) => {
    const scoreA = a.scoring?.totalScore || 0;
    const scoreB = b.scoring?.totalScore || 0;

    if (filters.sortBy === 'score') {
      return scoreB - scoreA;
    } else if (filters.sortBy === 'recent') {
      return new Date(b.metadata?.analyzedAt || 0) - new Date(a.metadata?.analyzedAt || 0);
    }

    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔍 Lead Discovery Tool
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Intelligent business intelligence and lead research
              </p>
            </div>
            <ExportPanel leads={filteredLeads} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <SearchBar
          onAnalyze={analyzeLead}
          onSearch={searchGitHub}
          loading={loading}
        />

        {/* Stats */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="text-sm text-gray-600">Total Leads</div>
              <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">High Priority</div>
              <div className="text-2xl font-bold text-red-600">
                {leads.filter(l => l.scoring?.priority === 'high').length}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-bold text-primary-600">
                {(leads.reduce((sum, l) => sum + (l.scoring?.totalScore || 0), 0) / leads.length).toFixed(1)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Contacts Found</div>
              <div className="text-2xl font-bold text-green-600">
                {leads.reduce((sum, l) => sum + (l.contact?.emails?.length || 0), 0)}
              </div>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {leads.length > 0 && (
          <FilterPanel filters={filters} setFilters={setFilters} />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lead List */}
          <div className="lg:col-span-1">
            <LeadList
              leads={filteredLeads}
              selectedLead={selectedLead}
              onSelectLead={setSelectedLead}
              loading={loading}
            />
          </div>

          {/* Lead Details */}
          <div className="lg:col-span-2">
            <LeadDetails lead={selectedLead} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
