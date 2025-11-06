import type {
  Lead,
  LeadScoring,
  LeadScoreBreakdown,
  GitHubData,
  TechnologyData,
  CompanyProfile,
  ContactInfo,
} from '../types';
import logger from '../utils/logger';

class LeadScoringService {
  private weights = {
    github: 0.25,
    technology: 0.2,
    company: 0.25,
    contact: 0.15,
    engagement: 0.15,
  };

  calculateLeadScore(leadData: Partial<Lead>): LeadScoring {
    logger.debug('Calculating lead score');

    const scores: LeadScoreBreakdown = {
      github: this.scoreGitHub(leadData.github),
      technology: this.scoreTechnology(leadData.technology),
      company: this.scoreCompany(leadData.company),
      contact: this.scoreContact(leadData.contact),
      engagement: this.scoreEngagement(leadData.engagement),
    };

    const totalScore = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + value * this.weights[key as keyof typeof this.weights];
    }, 0);

    const grade = this.calculateGrade(totalScore);
    const priority = this.calculatePriority(totalScore, scores);

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      grade,
      priority,
      breakdown: scores,
      reasoning: this.generateReasoning(scores, leadData),
      confidence: this.calculateConfidence(leadData),
    };
  }

  private scoreGitHub(github?: GitHubData): number {
    if (!github) return 0;

    let score = 0;

    if (github.analysis) {
      score += github.analysis.activityScore * 30;
      score += github.analysis.popularityScore * 30;
    }

    if (github.stars) {
      score += Math.min(20, (github.stars / 100) * 20);
    }

    if (github.contributors && github.contributors.length > 0) {
      score += Math.min(10, github.contributors.length * 2);
    }

    if (github.pushedAt) {
      const daysSinceUpdate =
        (Date.now() - new Date(github.pushedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) score += 10;
    }

    return Math.min(100, score);
  }

  private scoreTechnology(technology?: TechnologyData): number {
    if (!technology || !technology.technologies) return 0;

    let score = 0;

    const modernFrameworks = ['React', 'Vue.js', 'Angular', 'Next.js', 'Node.js'];
    const frontend = technology.technologies.frontend || [];
    const backend = technology.technologies.backend || [];

    const hasModernTech = [...frontend, ...backend].some((tech) =>
      modernFrameworks.includes(tech.name)
    );

    if (hasModernTech) score += 30;

    if (technology.technologies.analytics?.length > 0) {
      score += 20;
    }

    if (technology.technologies.ecommerce?.length > 0) {
      score += 25;
    }

    if (technology.technologies.marketing?.length > 0) {
      score += 15;
    }

    if (technology.technologies.security?.length > 0) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private scoreCompany(company?: CompanyProfile): number {
    if (!company) return 0;

    let score = 0;

    if (company.publicRepos && (company.publicRepos as any) > 10) score += 20;
    if (company.followers && (company.followers as any) > 100) score += 20;

    if (company.email) score += 15;
    if (company.website) score += 15;
    if (company.location) score += 10;

    if (company.createdAt) {
      const yearsOld =
        (Date.now() - new Date(company.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsOld > 2) score += 20;
    }

    return Math.min(100, score);
  }

  private scoreContact(contact?: ContactInfo): number {
    if (!contact) return 0;

    let score = 0;

    if (contact.emails && contact.emails.length > 0) {
      score += 40;
      if (contact.emails.length > 2) score += 10;
    }

    if (contact.social) {
      const platforms = Object.keys(contact.social).length;
      score += Math.min(30, platforms * 10);
    }

    if (contact.social?.linkedin) {
      score += 20;
    }

    return Math.min(100, score);
  }

  private scoreEngagement(engagement?: { lastUpdate?: string; socialActivity?: number }): number {
    if (!engagement) return 50;

    let score = 50;

    if (engagement.lastUpdate) {
      const daysSince =
        (Date.now() - new Date(engagement.lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) score += 30;
      else if (daysSince < 30) score += 20;
      else if (daysSince < 90) score += 10;
    }

    if (engagement.socialActivity) {
      score += Math.min(20, engagement.socialActivity * 5);
    }

    return Math.min(100, score);
  }

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  }

  private calculatePriority(
    totalScore: number,
    scores: LeadScoreBreakdown
  ): 'high' | 'medium' | 'low' | 'very-low' {
    if (totalScore >= 70) return 'high';

    const hasStrongArea = Object.values(scores).some((score) => score >= 80);
    if (hasStrongArea && totalScore >= 50) return 'high';

    if (totalScore >= 50) return 'medium';
    if (totalScore >= 30) return 'low';

    return 'very-low';
  }

  private generateReasoning(scores: LeadScoreBreakdown, leadData: Partial<Lead>): string[] {
    const reasons: string[] = [];

    if (scores.github >= 70) {
      reasons.push('Strong GitHub presence with active development');
    } else if (scores.github < 30) {
      reasons.push('Limited GitHub activity or visibility');
    }

    if (scores.technology >= 70) {
      reasons.push('Modern technology stack indicates technical sophistication');
    }
    if (leadData.technology?.technologies?.ecommerce?.length) {
      reasons.push('E-commerce platform suggests revenue potential');
    }

    if (scores.company >= 70) {
      reasons.push('Well-established company with strong online presence');
    }
    if (leadData.company?.email) {
      reasons.push('Direct contact information available');
    }

    if (scores.contact >= 60) {
      reasons.push('Multiple contact channels available');
    } else if (scores.contact < 30) {
      reasons.push('Limited contact information found');
    }

    if (scores.engagement >= 70) {
      reasons.push('Recent activity indicates active business');
    }

    if (reasons.length === 0) {
      reasons.push('Moderate potential - requires further research');
    }

    return reasons;
  }

  private calculateConfidence(leadData: Partial<Lead>): number {
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

    if (leadData.contact?.emails?.length) {
      confidence += 0.95;
      factors++;
    }

    return factors > 0 ? Math.round((confidence / factors) * 100) / 100 : 0.5;
  }

  prioritizeLeads(leads: Lead[]): Lead[] {
    return leads
      .map((lead) => ({
        ...lead,
        scoring: this.calculateLeadScore(lead),
      }))
      .sort((a, b) => b.scoring.totalScore - a.scoring.totalScore);
  }

  filterLeadsByScore(leads: Lead[], minScore = 50): Lead[] {
    return leads.filter((lead) => {
      const score = this.calculateLeadScore(lead);
      return score.totalScore >= minScore;
    });
  }

  categorizeLeads(leads: Lead[]): { hot: Lead[]; warm: Lead[]; cold: Lead[] } {
    const scored = leads.map((lead) => ({
      ...lead,
      scoring: this.calculateLeadScore(lead),
    }));

    return {
      hot: scored.filter((l) => l.scoring.totalScore >= 70),
      warm: scored.filter((l) => l.scoring.totalScore >= 50 && l.scoring.totalScore < 70),
      cold: scored.filter((l) => l.scoring.totalScore < 50),
    };
  }
}

export default new LeadScoringService();
