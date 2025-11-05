const axios = require('axios');
const cheerio = require('cheerio');

class TechnologyDetector {
  constructor() {
    this.timeout = 10000;
  }

  async detectTechnologies(url) {
    try {
      // Ensure URL has protocol
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
      const headers = response.headers;
      const $ = cheerio.load(html);

      const technologies = {
        frontend: this.detectFrontend($, html),
        backend: this.detectBackend(headers, html),
        analytics: this.detectAnalytics($, html),
        hosting: this.detectHosting(headers),
        cms: this.detectCMS($, html, headers),
        ecommerce: this.detectEcommerce($, html),
        marketing: this.detectMarketing($, html),
        security: this.detectSecurity(headers)
      };

      const confidence = this.calculateConfidence(technologies);

      return {
        url,
        technologies,
        confidence,
        summary: this.generateSummary(technologies),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Technology detection error:', error.message);
      throw new Error('Failed to detect technologies for ' + url);
    }
  }

  detectFrontend($, html) {
    const frameworks = [];

    // React
    if (html.includes('react') || html.includes('__REACT') || $('[data-reactroot]').length > 0) {
      frameworks.push({ name: 'React', confidence: 0.9 });
    }

    // Vue.js
    if (html.includes('vue') || $('[data-v-]').length > 0) {
      frameworks.push({ name: 'Vue.js', confidence: 0.9 });
    }

    // Angular
    if (html.includes('ng-version') || $('[ng-version]').length > 0) {
      frameworks.push({ name: 'Angular', confidence: 0.95 });
    }

    // Next.js
    if (html.includes('__NEXT_DATA__') || $('#__next').length > 0) {
      frameworks.push({ name: 'Next.js', confidence: 0.95 });
    }

    // jQuery
    if (html.includes('jquery') || typeof $ !== 'undefined') {
      frameworks.push({ name: 'jQuery', confidence: 0.8 });
    }

    // Tailwind CSS
    if (html.includes('tailwind') || $('[class*="tw-"]').length > 0) {
      frameworks.push({ name: 'Tailwind CSS', confidence: 0.85 });
    }

    // Bootstrap
    if (html.includes('bootstrap') || $('[class*="col-"]').length > 10) {
      frameworks.push({ name: 'Bootstrap', confidence: 0.8 });
    }

    return frameworks;
  }

  detectBackend(headers, html) {
    const backend = [];

    // Server detection
    const server = headers['server'];
    if (server) {
      if (server.includes('nginx')) {
        backend.push({ name: 'Nginx', type: 'web-server', confidence: 1.0 });
      }
      if (server.includes('Apache')) {
        backend.push({ name: 'Apache', type: 'web-server', confidence: 1.0 });
      }
    }

    // Framework detection
    if (headers['x-powered-by']) {
      const powered = headers['x-powered-by'].toLowerCase();
      if (powered.includes('express')) {
        backend.push({ name: 'Express.js', type: 'framework', confidence: 1.0 });
      }
      if (powered.includes('php')) {
        backend.push({ name: 'PHP', type: 'language', confidence: 1.0 });
      }
      if (powered.includes('asp.net')) {
        backend.push({ name: 'ASP.NET', type: 'framework', confidence: 1.0 });
      }
    }

    // Language detection from HTML patterns
    if (html.includes('wp-content') || html.includes('wordpress')) {
      backend.push({ name: 'WordPress', type: 'cms', confidence: 0.95 });
    }

    return backend;
  }

  detectAnalytics($, html) {
    const analytics = [];

    // Google Analytics
    if (html.includes('google-analytics.com') || html.includes('gtag') || html.includes('UA-')) {
      analytics.push({ name: 'Google Analytics', confidence: 0.95 });
    }

    // Google Tag Manager
    if (html.includes('googletagmanager.com') || html.includes('GTM-')) {
      analytics.push({ name: 'Google Tag Manager', confidence: 0.95 });
    }

    // Mixpanel
    if (html.includes('mixpanel')) {
      analytics.push({ name: 'Mixpanel', confidence: 0.9 });
    }

    // Segment
    if (html.includes('segment.com') || html.includes('analytics.js')) {
      analytics.push({ name: 'Segment', confidence: 0.9 });
    }

    // Hotjar
    if (html.includes('hotjar')) {
      analytics.push({ name: 'Hotjar', confidence: 0.9 });
    }

    return analytics;
  }

  detectHosting(headers) {
    const hosting = [];

    // Cloudflare
    if (headers['cf-ray'] || headers['server']?.includes('cloudflare')) {
      hosting.push({ name: 'Cloudflare', type: 'cdn', confidence: 1.0 });
    }

    // Vercel
    if (headers['x-vercel-id'] || headers['server']?.includes('vercel')) {
      hosting.push({ name: 'Vercel', type: 'hosting', confidence: 1.0 });
    }

    // Netlify
    if (headers['x-nf-request-id'] || headers['server']?.includes('netlify')) {
      hosting.push({ name: 'Netlify', type: 'hosting', confidence: 1.0 });
    }

    // AWS
    if (headers['x-amz-cf-id'] || headers['x-amz-request-id']) {
      hosting.push({ name: 'AWS', type: 'hosting', confidence: 1.0 });
    }

    return hosting;
  }

  detectCMS($, html, headers) {
    const cms = [];

    // WordPress
    if (html.includes('wp-content') || html.includes('wp-includes')) {
      cms.push({ name: 'WordPress', confidence: 0.95 });
    }

    // Shopify
    if (html.includes('cdn.shopify.com') || html.includes('Shopify')) {
      cms.push({ name: 'Shopify', confidence: 0.95 });
    }

    // Wix
    if (html.includes('wix.com') || headers['x-wix-request-id']) {
      cms.push({ name: 'Wix', confidence: 0.95 });
    }

    // Squarespace
    if (html.includes('squarespace')) {
      cms.push({ name: 'Squarespace', confidence: 0.9 });
    }

    return cms;
  }

  detectEcommerce($, html) {
    const ecommerce = [];

    // Shopify
    if (html.includes('shopify')) {
      ecommerce.push({ name: 'Shopify', confidence: 0.95 });
    }

    // WooCommerce
    if (html.includes('woocommerce')) {
      ecommerce.push({ name: 'WooCommerce', confidence: 0.95 });
    }

    // Magento
    if (html.includes('magento')) {
      ecommerce.push({ name: 'Magento', confidence: 0.9 });
    }

    // Stripe
    if (html.includes('stripe')) {
      ecommerce.push({ name: 'Stripe', confidence: 0.85 });
    }

    return ecommerce;
  }

  detectMarketing($, html) {
    const marketing = [];

    // HubSpot
    if (html.includes('hubspot')) {
      marketing.push({ name: 'HubSpot', confidence: 0.9 });
    }

    // Mailchimp
    if (html.includes('mailchimp')) {
      marketing.push({ name: 'Mailchimp', confidence: 0.9 });
    }

    // Intercom
    if (html.includes('intercom')) {
      marketing.push({ name: 'Intercom', confidence: 0.9 });
    }

    return marketing;
  }

  detectSecurity(headers) {
    const security = [];

    if (headers['strict-transport-security']) {
      security.push({ name: 'HSTS', confidence: 1.0 });
    }

    if (headers['content-security-policy']) {
      security.push({ name: 'CSP', confidence: 1.0 });
    }

    if (headers['x-frame-options']) {
      security.push({ name: 'X-Frame-Options', confidence: 1.0 });
    }

    return security;
  }

  calculateConfidence(technologies) {
    let totalConfidence = 0;
    let count = 0;

    Object.values(technologies).forEach(category => {
      if (Array.isArray(category)) {
        category.forEach(tech => {
          totalConfidence += tech.confidence || 0;
          count++;
        });
      }
    });

    return count > 0 ? totalConfidence / count : 0;
  }

  generateSummary(technologies) {
    const summary = [];

    Object.entries(technologies).forEach(([category, techs]) => {
      if (techs.length > 0) {
        summary.push(`${category}: ${techs.map(t => t.name).join(', ')}`);
      }
    });

    return summary;
  }
}

module.exports = new TechnologyDetector();
