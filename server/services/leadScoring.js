class LeadScoring {
  constructor() {
    this.weights = {
      github: 0.25,
      technology: 0.20,
      company: 0.25,
      contact: 0.15,
      engagement: 0.15
    };
  }

  calculateLeadScore(leadData) {
    const scores = {
      github: this.scoreGitHub(leadData.github),
      technology: this.scoreTechnology(leadData.technology),
      company: this.scoreCompany(leadData.company),
      contact: this.scoreContact(leadData.contact),
      engagement: this.scoreEngagement(leadData.engagement)
    };

    const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * this.weights[key]);
    }, 0);

    const grade = this.calculateGrade(totalScore);
    const priority = this.calculatePriority(totalScore, scores);

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      grade,
      priority,
      breakdown: scores,
      reasoning: this.generateReasoning(scores, leadData),
      confidence: this.calculateConfidence(leadData)
    };
  }

  scoreGitHub(github) {
    if (!github) return 0;

    let score = 0;

    // Repository activity
    if (github.analysis) {
      score += github.analysis.activityScore * 30;
      score += github.analysis.popularityScore * 30;
    }

    // Stars and engagement
    if (github.stars) {
      score += Math.min(20, (github.stars / 100) * 20);
    }

    // Contributors (team size indicator)
    if (github.contributors && github.contributors.length > 0) {
      score += Math.min(10, github.contributors.length * 2);
    }

    // Recent activity
    if (github.pushedAt) {
      const daysSinceUpdate = (Date.now() - new Date(github.pushedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) score += 10;
    }

    return Math.min(100, score);
  }

  scoreTechnology(technology) {
    if (!technology || !technology.technologies) return 0;

    let score = 0;

    // Modern tech stack
    const modernFrameworks = ['React', 'Vue.js', 'Angular', 'Next.js', 'Node.js'];
    const frontend = technology.technologies.frontend || [];
    const backend = technology.technologies.backend || [];

    const hasModernTech = [...frontend, ...backend].some(tech =>
      modernFrameworks.includes(tech.name)
    );

    if (hasModernTech) score += 30;

    // Analytics (shows data-driven approach)
    if (technology.technologies.analytics?.length > 0) {
      score += 20;
    }

    // E-commerce (revenue potential)
    if (technology.technologies.ecommerce?.length > 0) {
      score += 25;
    }

    // Marketing tools (shows investment in growth)
    if (technology.technologies.marketing?.length > 0) {
      score += 15;
    }

    // Security (shows professionalism)
    if (technology.technologies.security?.length > 0) {
      score += 10;
    }

    return Math.min(100, score);
  }

  scoreCompany(company) {
    if (!company) return 0;

    let score = 0;

    // Company size indicators
    if (company.publicRepos > 10) score += 20;
    if (company.followers > 100) score += 20;

    // Contact information available
    if (company.email) score += 15;
    if (company.website) score += 15;
    if (company.location) score += 10;

    // Company age (established presence)
    if (company.createdAt) {
      const yearsOld = (Date.now() - new Date(company.createdAt)) / (1000 * 60 * 60 * 24 * 365);
      if (yearsOld > 2) score += 20;
    }

    return Math.min(100, score);
  }

  scoreContact(contact) {
    if (!contact) return 0;

    let score = 0;

    // Email availability
    if (contact.emails && contact.emails.length > 0) {
      score += 40;
      // Multiple contacts
      if (contact.emails.length > 2) score += 10;
    }

    // Social media presence
    if (contact.social) {
      const platforms = Object.keys(contact.social).length;
      score += Math.min(30, platforms * 10);
    }

    // LinkedIn (professional network)
    if (contact.social?.linkedin) {
      score += 20;
    }

    return Math.min(100, score);
  }

  scoreEngagement(engagement) {
    if (!engagement) return 50; // Neutral score if no data

    let score = 50;

    // Recent website updates
    if (engagement.lastUpdate) {
      const daysSince = (Date.now() - new Date(engagement.lastUpdate)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) score += 30;
      else if (daysSince < 30) score += 20;
      else if (daysSince < 90) score += 10;
    }

    // Social media activity
    if (engagement.socialActivity) {
      score += Math.min(20, engagement.socialActivity * 5);
    }

    return Math.min(100, score);
  }

  calculateGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  }

  calculatePriority(totalScore, scores) {
    // High priority: High overall score OR strong in specific areas
    if (totalScore >= 70) return 'high';

    // Check for standout characteristics
    const hasStrongArea = Object.values(scores).some(score => score >= 80);
    if (hasStrongArea && totalScore >= 50) return 'high';

    if (totalScore >= 50) return 'medium';
    if (totalScore >= 30) return 'low';

    return 'very-low';
  }

  generateReasoning(scores, leadData) {
    const reasons = [];

    // GitHub reasoning
    if (scores.github >= 70) {
      reasons.push('Strong GitHub presence with active development');
    } else if (scores.github < 30) {
      reasons.push('Limited GitHub activity or visibility');
    }

    // Technology reasoning
    if (scores.technology >= 70) {
      reasons.push('Modern technology stack indicates technical sophistication');
    }
    if (leadData.technology?.technologies?.ecommerce?.length > 0) {
      reasons.push('E-commerce platform suggests revenue potential');
    }

    // Company reasoning
    if (scores.company >= 70) {
      reasons.push('Well-established company with strong online presence');
    }
    if (leadData.company?.email) {
      reasons.push('Direct contact information available');
    }

    // Contact reasoning
    if (scores.contact >= 60) {
      reasons.push('Multiple contact channels available');
    } else if (scores.contact < 30) {
      reasons.push('Limited contact information found');
    }

    // Engagement reasoning
    if (scores.engagement >= 70) {
      reasons.push('Recent activity indicates active business');
    }

    if (reasons.length === 0) {
      reasons.push('Moderate potential - requires further research');
    }

    return reasons;
  }

  calculateConfidence(leadData) {
    let confidence = 0;
    let factors = 0;

    if (leadData.github) {
      confidence += 0.9;
      factors++;
    }

    if (leadData.technology?.confidence) {
      confidence += leadData.technology.confidence;
      factors++;
    }

    if (leadData.company) {
      confidence += 0.85;
      factors++;
    }

    if (leadData.contact?.emails?.length > 0) {
      confidence += 0.95;
      factors++;
    }

    return factors > 0 ? Math.round((confidence / factors) * 100) / 100 : 0.5;
  }

  prioritizeLeads(leads) {
    return leads
      .map(lead => ({
        ...lead,
        scoring: this.calculateLeadScore(lead)
      }))
      .sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);
  }

  filterLeadsByScore(leads, minScore = 50) {
    return leads.filter(lead => {
      const score = this.calculateLeadScore(lead);
      return score.totalScore >= minScore;
    });
  }

  categorizeLeads(leads) {
    const scored = leads.map(lead => ({
      ...lead,
      scoring: this.calculateLeadScore(lead)
    }));

    return {
      hot: scored.filter(l => l.scoring.totalScore >= 70),
      warm: scored.filter(l => l.scoring.totalScore >= 50 && l.scoring.totalScore < 70),
      cold: scored.filter(l => l.scoring.totalScore < 50)
    };
  }
}

module.exports = new LeadScoring();
