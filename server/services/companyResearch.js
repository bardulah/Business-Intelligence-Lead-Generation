const axios = require('axios');
const cheerio = require('cheerio');

class CompanyResearch {
  constructor() {
    this.timeout = 10000;
  }

  async researchCompany(domain, additionalData = {}) {
    try {
      const [websiteData, whoisData] = await Promise.all([
        this.analyzeWebsite(domain),
        this.getWhoisData(domain).catch(() => null)
      ]);

      const profile = {
        domain,
        name: websiteData.name || additionalData.name || this.extractCompanyName(domain),
        description: websiteData.description,
        industry: websiteData.industry,
        location: additionalData.location || websiteData.location,
        foundedYear: this.extractFoundedYear(websiteData, whoisData),
        size: this.estimateCompanySize(additionalData, websiteData),
        website: {
          title: websiteData.title,
          description: websiteData.description,
          keywords: websiteData.keywords
        },
        businessModel: this.detectBusinessModel(websiteData),
        features: websiteData.features,
        socialProof: websiteData.socialProof,
        metadata: {
          lastAnalyzed: new Date().toISOString(),
          confidence: this.calculateResearchConfidence(websiteData, additionalData)
        }
      };

      return profile;
    } catch (error) {
      console.error('Company research error:', error.message);
      throw error;
    }
  }

  async analyzeWebsite(domain) {
    try {
      let url = domain;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      return {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [],
        name: this.extractCompanyNameFromPage($),
        industry: this.detectIndustry($, html),
        location: this.extractLocation($),
        features: this.extractFeatures($),
        socialProof: this.extractSocialProof($)
      };
    } catch (error) {
      console.error('Website analysis error:', error.message);
      return {
        title: '',
        description: '',
        keywords: [],
        features: [],
        socialProof: {}
      };
    }
  }

  extractCompanyNameFromPage($) {
    // Try various sources for company name
    const sources = [
      $('meta[property="og:site_name"]').attr('content'),
      $('meta[name="application-name"]').attr('content'),
      $('.logo').attr('alt'),
      $('header .brand').text(),
      $('title').text().split('|')[0].split('-')[0]
    ];

    for (const source of sources) {
      if (source && source.trim().length > 0) {
        return source.trim();
      }
    }

    return null;
  }

  extractCompanyName(domain) {
    // Extract from domain
    const name = domain
      .replace(/^(https?:\/\/)?(www\.)?/, '')
      .split('.')[0];

    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  detectIndustry($, html) {
    const content = html.toLowerCase();
    const keywords = $('meta[name="keywords"]').attr('content')?.toLowerCase() || '';

    const industries = {
      'SaaS': ['saas', 'software as a service', 'cloud software', 'platform'],
      'E-commerce': ['shop', 'store', 'buy', 'cart', 'checkout', 'products'],
      'Fintech': ['finance', 'payment', 'banking', 'financial', 'crypto'],
      'Healthcare': ['health', 'medical', 'healthcare', 'patient', 'clinic'],
      'Education': ['education', 'learning', 'course', 'training', 'school'],
      'Marketing': ['marketing', 'advertising', 'analytics', 'seo', 'social media'],
      'Development': ['developer', 'api', 'code', 'programming', 'development'],
      'Design': ['design', 'creative', 'graphics', 'ui', 'ux'],
      'Consulting': ['consulting', 'advisory', 'services', 'consulting']
    };

    for (const [industry, terms] of Object.entries(industries)) {
      if (terms.some(term => content.includes(term) || keywords.includes(term))) {
        return industry;
      }
    }

    return 'General';
  }

  extractLocation($) {
    const sources = [
      $('meta[name="geo.region"]').attr('content'),
      $('address').text(),
      $('[itemprop="address"]').text(),
      $('.location').text(),
      $('.address').text()
    ];

    for (const source of sources) {
      if (source && source.trim().length > 0) {
        return source.trim();
      }
    }

    return null;
  }

  extractFoundedYear(websiteData, whoisData) {
    // Try to extract from website
    const text = JSON.stringify(websiteData).toLowerCase();
    const yearMatch = text.match(/founded.{0,20}(\d{4})|since.{0,20}(\d{4})|est.{0,20}(\d{4})/i);

    if (yearMatch) {
      const year = parseInt(yearMatch[1] || yearMatch[2] || yearMatch[3]);
      if (year >= 1900 && year <= new Date().getFullYear()) {
        return year;
      }
    }

    // Try from WHOIS
    if (whoisData && whoisData.creationDate) {
      return new Date(whoisData.creationDate).getFullYear();
    }

    return null;
  }

  estimateCompanySize(additionalData, websiteData) {
    // Use GitHub data if available
    if (additionalData.publicRepos !== undefined) {
      if (additionalData.publicRepos > 50) return 'Large (50+ employees)';
      if (additionalData.publicRepos > 20) return 'Medium (20-50 employees)';
      if (additionalData.publicRepos > 5) return 'Small (5-20 employees)';
      return 'Startup (1-5 employees)';
    }

    if (additionalData.contributors) {
      const count = additionalData.contributors.length;
      if (count > 20) return 'Large (50+ employees)';
      if (count > 10) return 'Medium (20-50 employees)';
      if (count > 3) return 'Small (5-20 employees)';
      return 'Startup (1-5 employees)';
    }

    return 'Unknown';
  }

  detectBusinessModel(websiteData) {
    const content = JSON.stringify(websiteData).toLowerCase();

    const models = [];

    if (content.includes('pricing') || content.includes('subscribe') || content.includes('plan')) {
      models.push('Subscription');
    }

    if (content.includes('free trial') || content.includes('freemium')) {
      models.push('Freemium');
    }

    if (content.includes('enterprise') || content.includes('custom pricing')) {
      models.push('Enterprise');
    }

    if (content.includes('marketplace') || content.includes('sellers')) {
      models.push('Marketplace');
    }

    if (content.includes('advertising') || content.includes('ad-free')) {
      models.push('Ad-supported');
    }

    return models.length > 0 ? models : ['Unknown'];
  }

  extractFeatures($) {
    const features = [];

    // Look for feature sections
    $('[class*="feature"], [class*="benefit"], [class*="service"]').each((i, elem) => {
      if (i < 10) { // Limit to 10 features
        const text = $(elem).text().trim();
        if (text.length > 10 && text.length < 200) {
          features.push(text);
        }
      }
    });

    // Look for lists
    $('ul li, ol li').each((i, elem) => {
      if (features.length < 10) {
        const text = $(elem).text().trim();
        if (text.length > 10 && text.length < 150) {
          features.push(text);
        }
      }
    });

    return features.slice(0, 10);
  }

  extractSocialProof($) {
    const proof = {};

    // Customer count
    const customerText = $('body').text();
    const customerMatch = customerText.match(/(\d+[\d,]*)\+?\s*(customers?|users?|clients?)/i);
    if (customerMatch) {
      proof.customers = customerMatch[1].replace(/,/g, '');
    }

    // Testimonials
    const testimonialCount = $('[class*="testimonial"], [class*="review"]').length;
    if (testimonialCount > 0) {
      proof.testimonials = testimonialCount;
    }

    // Awards or certifications
    const awards = $('[class*="award"], [class*="certification"], [class*="badge"]').length;
    if (awards > 0) {
      proof.awards = awards;
    }

    // Press mentions
    const press = $('[class*="press"], [class*="featured"], [class*="media"]').length;
    if (press > 0) {
      proof.pressMentions = press;
    }

    return proof;
  }

  async getWhoisData(domain) {
    // Simplified WHOIS - in production, you'd use a WHOIS service
    try {
      // Remove protocol and www
      const cleanDomain = domain
        .replace(/^(https?:\/\/)?(www\.)?/, '')
        .split('/')[0];

      // This would normally call a WHOIS API
      return {
        domain: cleanDomain,
        creationDate: null,
        registrar: null
      };
    } catch (error) {
      return null;
    }
  }

  calculateResearchConfidence(websiteData, additionalData) {
    let confidence = 0;
    let factors = 0;

    if (websiteData.title) {
      confidence += 0.9;
      factors++;
    }

    if (websiteData.description) {
      confidence += 0.8;
      factors++;
    }

    if (websiteData.industry !== 'General') {
      confidence += 0.7;
      factors++;
    }

    if (additionalData.publicRepos || additionalData.contributors) {
      confidence += 0.95;
      factors++;
    }

    if (Object.keys(websiteData.socialProof).length > 0) {
      confidence += 0.85;
      factors++;
    }

    return factors > 0 ? Math.round((confidence / factors) * 100) / 100 : 0.5;
  }
}

module.exports = new CompanyResearch();
