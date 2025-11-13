/**
 * Apollo.io Company Enrichment Service
 *
 * Replaces Clearbit with Apollo.io for B2B data enrichment
 * Free tier: 10,000 credits/year (much better than Clearbit's old 50 credits)
 *
 * API Docs: https://apolloio.github.io/apollo-api-docs/
 * Get API Key: https://app.apollo.io/#/settings/integrations/api
 */

const axios = require('axios');

class ApolloEnrichment {
  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY;
    this.baseUrl = 'https://api.apollo.io/v1';
    this.timeout = 15000;

    if (!this.apiKey) {
      console.warn('⚠️  APOLLO_API_KEY not set - enrichment features will be limited');
    }
  }

  /**
   * Check if Apollo.io is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Enrich company data using Apollo.io
   * @param {string} domain - Company domain (e.g., 'stripe.com')
   * @param {object} fallbackData - Data from web scraping to merge with Apollo data
   * @returns {object} Enriched company profile
   */
  async enrichCompany(domain, fallbackData = {}) {
    if (!this.isConfigured()) {
      console.log('Apollo.io not configured, using fallback data');
      return this.formatFallbackData(fallbackData);
    }

    try {
      // Clean domain
      const cleanDomain = this.cleanDomain(domain);

      // Call Apollo.io Organization Enrichment API
      const response = await axios.post(
        `${this.baseUrl}/organizations/enrich`,
        {
          domain: cleanDomain,
          reveal_personal_emails: false // Respect privacy
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': this.apiKey
          },
          timeout: this.timeout
        }
      );

      const apolloData = response.data.organization;

      if (!apolloData) {
        console.log(`No Apollo.io data found for ${cleanDomain}, using fallback`);
        return this.formatFallbackData(fallbackData);
      }

      // Merge Apollo data with fallback data
      return this.formatApolloData(apolloData, fallbackData);

    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`Company ${domain} not found in Apollo.io, using fallback`);
      } else if (error.response?.status === 429) {
        console.error('Apollo.io rate limit reached');
      } else if (error.response?.status === 401) {
        console.error('Apollo.io API key invalid');
      } else {
        console.error('Apollo.io enrichment error:', error.message);
      }

      return this.formatFallbackData(fallbackData);
    }
  }

  /**
   * Search for people at a company (for contact discovery)
   * @param {string} domain - Company domain
   * @param {object} filters - Search filters (titles, seniority, etc.)
   * @returns {array} Array of contacts
   */
  async findContacts(domain, filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const cleanDomain = this.cleanDomain(domain);

      const searchParams = {
        organization_domains: [cleanDomain],
        page: 1,
        per_page: filters.limit || 10,
        // person_titles: filters.titles || ['Founder', 'CEO', 'CTO', 'VP'],
        // person_seniorities: filters.seniorities || ['founder', 'c_suite', 'vp']
      };

      // Only add filters if explicitly provided
      if (filters.titles && filters.titles.length > 0) {
        searchParams.person_titles = filters.titles;
      }

      if (filters.seniorities && filters.seniorities.length > 0) {
        searchParams.person_seniorities = filters.seniorities;
      }

      const response = await axios.post(
        `${this.baseUrl}/mixed_people/search`,
        searchParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': this.apiKey
          },
          timeout: this.timeout
        }
      );

      const people = response.data.people || [];

      return people.map(person => this.formatContact(person));

    } catch (error) {
      console.error('Apollo.io contact search error:', error.message);
      return [];
    }
  }

  /**
   * Get technology stack used by company
   * @param {string} domain - Company domain
   * @returns {array} Array of technologies
   */
  async getTechStack(domain) {
    // TODO: Implement after enrichCompany which includes tech stack
    // For now, tech stack is included in enrichCompany response
    return [];
  }

  /**
   * Format Apollo.io organization data
   */
  formatApolloData(apolloData, fallbackData) {
    return {
      domain: apolloData.website_url || fallbackData.domain,
      name: apolloData.name || fallbackData.name,
      description: apolloData.short_description || fallbackData.description,
      industry: apolloData.industry || fallbackData.industry,
      location: this.formatLocation(apolloData) || fallbackData.location,
      foundedYear: apolloData.founded_year || fallbackData.foundedYear,
      size: this.formatCompanySize(apolloData.estimated_num_employees) || fallbackData.size,

      // Apollo-specific enriched data
      employeeCount: apolloData.estimated_num_employees,
      revenue: this.formatRevenue(apolloData.estimated_annual_revenue),
      revenueRange: apolloData.estimated_annual_revenue,

      // Contact information
      phone: apolloData.phone,
      linkedin: apolloData.linkedin_url,
      facebook: apolloData.facebook_url,
      twitter: apolloData.twitter_url,

      // Business details
      businessModel: this.detectBusinessModel(apolloData) || fallbackData.businessModel,
      keywords: apolloData.keywords || [],

      // Technology stack
      technologies: apolloData.technologies || [],

      // Additional metadata
      metadata: {
        lastAnalyzed: new Date().toISOString(),
        dataSource: 'apollo.io',
        confidence: 0.95, // Apollo data is highly reliable
        apolloId: apolloData.id,
        ...(fallbackData.metadata || {})
      },

      // Merge fallback data for fields not provided by Apollo
      website: fallbackData.website || {},
      features: fallbackData.features || [],
      socialProof: fallbackData.socialProof || {}
    };
  }

  /**
   * Format fallback data when Apollo is unavailable
   */
  formatFallbackData(fallbackData) {
    return {
      ...fallbackData,
      metadata: {
        ...(fallbackData.metadata || {}),
        dataSource: 'web-scraping',
        apolloEnrichment: false
      }
    };
  }

  /**
   * Format contact from Apollo.io person data
   */
  formatContact(person) {
    return {
      name: person.name || `${person.first_name} ${person.last_name}`.trim(),
      firstName: person.first_name,
      lastName: person.last_name,
      title: person.title,
      seniority: person.seniority,
      email: person.email,
      phone: person.phone_numbers?.[0]?.sanitized_number,
      linkedin: person.linkedin_url,
      twitter: person.twitter_url,
      location: person.city && person.state ? `${person.city}, ${person.state}` : null,
      photoUrl: person.photo_url,
      confidence: person.email ? 0.9 : 0.6
    };
  }

  /**
   * Format location from Apollo data
   */
  formatLocation(apolloData) {
    const parts = [
      apolloData.city,
      apolloData.state,
      apolloData.country
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : null;
  }

  /**
   * Format employee count into size category
   */
  formatCompanySize(employeeCount) {
    if (!employeeCount) return 'Unknown';

    if (employeeCount >= 10000) return 'Enterprise (10,000+ employees)';
    if (employeeCount >= 1000) return 'Large (1,000-10,000 employees)';
    if (employeeCount >= 200) return 'Medium (200-1,000 employees)';
    if (employeeCount >= 50) return 'Small (50-200 employees)';
    if (employeeCount >= 10) return 'Startup (10-50 employees)';
    return 'Micro (1-10 employees)';
  }

  /**
   * Format revenue into readable string
   */
  formatRevenue(revenueRange) {
    if (!revenueRange) return null;

    const ranges = {
      'r_1_to_10m': '$1M-$10M',
      'r_10_to_50m': '$10M-$50M',
      'r_50_to_100m': '$50M-$100M',
      'r_100_to_250m': '$100M-$250M',
      'r_250_to_500m': '$250M-$500M',
      'r_500_to_1b': '$500M-$1B',
      'r_1b_to_10b': '$1B-$10B',
      'r_10b_plus': '$10B+'
    };

    return ranges[revenueRange] || revenueRange;
  }

  /**
   * Detect business model from Apollo data
   */
  detectBusinessModel(apolloData) {
    const models = [];
    const keywords = (apolloData.keywords || []).join(' ').toLowerCase();
    const description = (apolloData.short_description || '').toLowerCase();
    const combined = `${keywords} ${description}`;

    if (combined.includes('saas') || combined.includes('software as a service')) {
      models.push('SaaS');
    }

    if (combined.includes('b2b') || combined.includes('enterprise')) {
      models.push('B2B');
    }

    if (combined.includes('b2c') || combined.includes('consumer')) {
      models.push('B2C');
    }

    if (combined.includes('marketplace') || combined.includes('platform')) {
      models.push('Marketplace');
    }

    return models.length > 0 ? models : ['Unknown'];
  }

  /**
   * Clean domain for API calls
   */
  cleanDomain(domain) {
    return domain
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .split('/')[0]
      .toLowerCase()
      .trim();
  }

  /**
   * Get remaining API credits (if Apollo provides this)
   */
  async getCreditsRemaining() {
    if (!this.isConfigured()) {
      return { available: 0, configured: false };
    }

    try {
      // Apollo.io doesn't have a direct credits endpoint
      // Credits are shown in dashboard: https://app.apollo.io/#/settings/credits
      return {
        configured: true,
        message: 'Check credits at: https://app.apollo.io/#/settings/credits'
      };
    } catch (error) {
      return { available: 0, error: error.message };
    }
  }
}

module.exports = new ApolloEnrichment();
