const axios = require('axios');

class GitHubScanner {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.apiBase = 'https://api.github.com';
  }

  getHeaders() {
    return this.token ? { Authorization: `token ${this.token}` } : {};
  }

  async searchRepositories(query, options = {}) {
    try {
      const params = {
        q: query,
        sort: options.sort || 'stars',
        order: options.order || 'desc',
        per_page: options.limit || 30
      };

      const response = await axios.get(`${this.apiBase}/search/repositories`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.items.map(repo => this.formatRepository(repo));
    } catch (error) {
      console.error('GitHub search error:', error.message);
      throw new Error('Failed to search GitHub repositories');
    }
  }

  async getRepository(owner, repo) {
    try {
      const response = await axios.get(`${this.apiBase}/repos/${owner}/${repo}`, {
        headers: this.getHeaders()
      });

      return this.formatRepository(response.data);
    } catch (error) {
      console.error('GitHub repo fetch error:', error.message);
      throw new Error('Failed to fetch repository details');
    }
  }

  async getRepositoryLanguages(owner, repo) {
    try {
      const response = await axios.get(`${this.apiBase}/repos/${owner}/${repo}/languages`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('GitHub languages fetch error:', error.message);
      return {};
    }
  }

  async getRepositoryContributors(owner, repo) {
    try {
      const response = await axios.get(`${this.apiBase}/repos/${owner}/${repo}/contributors`, {
        headers: this.getHeaders(),
        params: { per_page: 10 }
      });

      return response.data.map(contributor => ({
        username: contributor.login,
        contributions: contributor.contributions,
        avatar: contributor.avatar_url,
        profile: contributor.html_url
      }));
    } catch (error) {
      console.error('GitHub contributors fetch error:', error.message);
      return [];
    }
  }

  async getOrganizationInfo(org) {
    try {
      const response = await axios.get(`${this.apiBase}/orgs/${org}`, {
        headers: this.getHeaders()
      });

      return {
        name: response.data.name,
        description: response.data.description,
        website: response.data.blog,
        location: response.data.location,
        email: response.data.email,
        publicRepos: response.data.public_repos,
        followers: response.data.followers,
        createdAt: response.data.created_at,
        avatar: response.data.avatar_url
      };
    } catch (error) {
      console.error('GitHub org fetch error:', error.message);
      return null;
    }
  }

  formatRepository(repo) {
    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: {
        username: repo.owner.login,
        type: repo.owner.type,
        avatar: repo.owner.avatar_url,
        url: repo.owner.html_url
      },
      description: repo.description,
      url: repo.html_url,
      homepage: repo.homepage,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count,
      language: repo.language,
      topics: repo.topics || [],
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      size: repo.size,
      hasIssues: repo.has_issues,
      hasWiki: repo.has_wiki,
      license: repo.license ? repo.license.name : null
    };
  }

  async analyzeRepository(owner, repo) {
    try {
      const [repoData, languages, contributors, orgInfo] = await Promise.all([
        this.getRepository(owner, repo),
        this.getRepositoryLanguages(owner, repo),
        this.getRepositoryContributors(owner, repo),
        repoData.owner.type === 'Organization' ? this.getOrganizationInfo(owner) : null
      ]);

      return {
        ...repoData,
        languages,
        contributors,
        organization: orgInfo,
        analysis: this.generateAnalysis(repoData, languages, contributors)
      };
    } catch (error) {
      console.error('Repository analysis error:', error.message);
      throw error;
    }
  }

  generateAnalysis(repo, languages, contributors) {
    const activity = this.calculateActivity(repo);
    const popularity = this.calculatePopularity(repo);
    const techStack = Object.keys(languages);

    return {
      activityScore: activity,
      popularityScore: popularity,
      techStack,
      isActive: activity > 0.5,
      isPopular: popularity > 0.6,
      teamSize: contributors.length,
      insights: this.generateInsights(repo, activity, popularity)
    };
  }

  calculateActivity(repo) {
    const daysSinceUpdate = (Date.now() - new Date(repo.pushedAt)) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate < 7) return 1.0;
    if (daysSinceUpdate < 30) return 0.8;
    if (daysSinceUpdate < 90) return 0.6;
    if (daysSinceUpdate < 180) return 0.4;
    return 0.2;
  }

  calculatePopularity(repo) {
    const stars = repo.stars;
    const forks = repo.forks;
    const watchers = repo.watchers;

    const score = Math.min(1.0, (stars / 1000) * 0.5 + (forks / 100) * 0.3 + (watchers / 500) * 0.2);
    return score;
  }

  generateInsights(repo, activity, popularity) {
    const insights = [];

    if (activity > 0.8) {
      insights.push('Very active development - recently updated');
    } else if (activity < 0.3) {
      insights.push('Low activity - may be archived or completed');
    }

    if (popularity > 0.7) {
      insights.push('High popularity - strong community interest');
    }

    if (repo.openIssues > 50) {
      insights.push('Many open issues - active user engagement');
    }

    if (repo.homepage) {
      insights.push('Has production website - commercially viable');
    }

    if (repo.license) {
      insights.push(`Licensed under ${repo.license}`);
    }

    return insights;
  }
}

module.exports = new GitHubScanner();
