const axios = require('axios');
const cheerio = require('cheerio');
const validator = require('email-validator');

class ContactExtractor {
  constructor() {
    this.timeout = 10000;
    this.emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    this.phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  }

  async extractContacts(url, additionalSources = {}) {
    try {
      const webContacts = await this.extractFromWebsite(url);
      const socialContacts = this.extractFromSocial(additionalSources);

      const emails = this.deduplicateEmails([
        ...webContacts.emails,
        ...socialContacts.emails
      ]);

      const phones = this.deduplicatePhones([
        ...webContacts.phones,
        ...socialContacts.phones
      ]);

      return {
        emails: this.categorizeEmails(emails),
        phones,
        social: {
          ...webContacts.social,
          ...socialContacts.social
        },
        linkedin: additionalSources.linkedin || null,
        confidence: this.calculateContactConfidence(emails, phones, webContacts.social)
      };
    } catch (error) {
      console.error('Contact extraction error:', error.message);
      return {
        emails: [],
        phones: [],
        social: {},
        confidence: 0
      };
    }
  }

  async extractFromWebsite(url) {
    try {
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

      // Extract emails
      const emails = this.findEmails(html, $);

      // Extract phone numbers
      const phones = this.findPhones(html, $);

      // Extract social media links
      const social = this.findSocialMedia($);

      // Try to find contact page
      const contactPageUrl = this.findContactPage($, url);
      let contactPageData = { emails: [], phones: [], social: {} };

      if (contactPageUrl) {
        contactPageData = await this.extractFromContactPage(contactPageUrl);
      }

      return {
        emails: [...emails, ...contactPageData.emails],
        phones: [...phones, ...contactPageData.phones],
        social: { ...social, ...contactPageData.social }
      };
    } catch (error) {
      console.error('Website extraction error:', error.message);
      return { emails: [], phones: [], social: {} };
    }
  }

  findEmails(html, $) {
    const emails = new Set();

    // Find in HTML content
    const matches = html.match(this.emailRegex) || [];
    matches.forEach(email => {
      if (this.isValidEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });

    // Find in mailto links
    $('a[href^="mailto:"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const email = href.replace('mailto:', '').split('?')[0];
      if (this.isValidEmail(email)) {
        emails.add(email.toLowerCase());
      }
    });

    return Array.from(emails);
  }

  findPhones(html, $) {
    const phones = new Set();

    // Find in tel links
    $('a[href^="tel:"]').each((i, elem) => {
      const href = $(elem).attr('href');
      const phone = href.replace('tel:', '').trim();
      phones.add(phone);
    });

    // Find in text content
    const matches = html.match(this.phoneRegex) || [];
    matches.forEach(phone => {
      const cleaned = phone.replace(/\s+/g, ' ').trim();
      if (cleaned.length >= 10) {
        phones.add(cleaned);
      }
    });

    return Array.from(phones);
  }

  findSocialMedia($) {
    const social = {};

    const platforms = {
      twitter: ['twitter.com', 'x.com'],
      linkedin: ['linkedin.com'],
      facebook: ['facebook.com'],
      instagram: ['instagram.com'],
      github: ['github.com'],
      youtube: ['youtube.com']
    };

    $('a[href*="linkedin.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="facebook.com"], a[href*="instagram.com"], a[href*="github.com"], a[href*="youtube.com"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (!href) return;

      for (const [platform, domains] of Object.entries(platforms)) {
        if (domains.some(domain => href.includes(domain))) {
          social[platform] = href;
          break;
        }
      }
    });

    return social;
  }

  findContactPage($, baseUrl) {
    const contactLinks = $('a[href*="contact"], a[href*="about"], a[href*="team"]');

    for (let i = 0; i < contactLinks.length; i++) {
      const href = $(contactLinks[i]).attr('href');
      if (href && (href.includes('contact') || href.includes('about'))) {
        try {
          const url = new URL(href, baseUrl);
          return url.href;
        } catch (e) {
          continue;
        }
      }
    }

    return null;
  }

  async extractFromContactPage(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      return {
        emails: this.findEmails(html, $),
        phones: this.findPhones(html, $),
        social: this.findSocialMedia($)
      };
    } catch (error) {
      return { emails: [], phones: [], social: {} };
    }
  }

  extractFromSocial(sources) {
    const emails = [];
    const social = {};

    if (sources.github) {
      if (sources.github.email) {
        emails.push(sources.github.email);
      }
      social.github = sources.github.url;
    }

    if (sources.linkedin) {
      social.linkedin = sources.linkedin;
    }

    return { emails, phones: [], social };
  }

  isValidEmail(email) {
    // Filter out common false positives
    const blacklist = [
      'example.com',
      'test.com',
      'localhost',
      '.png',
      '.jpg',
      '.gif',
      'wix.com',
      'wordpress.com'
    ];

    if (blacklist.some(item => email.includes(item))) {
      return false;
    }

    return validator.validate(email);
  }

  deduplicateEmails(emails) {
    const seen = new Set();
    return emails.filter(email => {
      const normalized = email.toLowerCase().trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  deduplicatePhones(phones) {
    const seen = new Set();
    return phones.filter(phone => {
      const normalized = phone.replace(/\D/g, '');
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  categorizeEmails(emails) {
    return emails.map(email => {
      const type = this.identifyEmailType(email);
      return {
        email,
        type,
        confidence: this.calculateEmailConfidence(email, type)
      };
    });
  }

  identifyEmailType(email) {
    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes('info@') || lowerEmail.includes('contact@')) {
      return 'general';
    }
    if (lowerEmail.includes('sales@') || lowerEmail.includes('business@')) {
      return 'sales';
    }
    if (lowerEmail.includes('support@') || lowerEmail.includes('help@')) {
      return 'support';
    }
    if (lowerEmail.includes('admin@') || lowerEmail.includes('webmaster@')) {
      return 'admin';
    }

    // Personal email (has name before @)
    const parts = lowerEmail.split('@');
    if (parts[0].length > 2 && !parts[0].includes('info') && !parts[0].includes('contact')) {
      return 'personal';
    }

    return 'unknown';
  }

  calculateEmailConfidence(email, type) {
    let confidence = 0.7;

    // Higher confidence for specific types
    if (type === 'sales' || type === 'business') confidence = 0.9;
    else if (type === 'general' || type === 'contact') confidence = 0.85;
    else if (type === 'personal') confidence = 0.95;

    // Lower confidence for generic domains
    if (email.includes('gmail.com') || email.includes('yahoo.com') || email.includes('hotmail.com')) {
      confidence -= 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  calculateContactConfidence(emails, phones, social) {
    let score = 0;

    if (emails.length > 0) score += 0.4;
    if (emails.length > 2) score += 0.1;
    if (phones.length > 0) score += 0.2;
    if (Object.keys(social).length > 0) score += 0.2;
    if (Object.keys(social).length > 2) score += 0.1;

    return Math.min(1, score);
  }
}

module.exports = new ContactExtractor();
