import axios, { AxiosError } from 'axios';
import { withRetry } from '../utils/retry';
import logger from '../utils/logger';
import { ExternalAPIError } from '../utils/errors';
import { cacheGet, cacheSet } from '../config/redis';
import type {
  GitHubRepository,
  GitHubData,
  GitHubContributor,
  GitHubOrganization,
  SearchOptions,
} from '../types';

class GitHubScanner {
  private token: string | undefined;
  private apiBase = 'https://api.github.com';
  private cacheTTL = 3600; // 1 hour

  constructor() {
    this.token = process.env.GITHUB_TOKEN;
  }

  private getHeaders() {
    return this.token ? { Authorization: `token ${this.token}` } : {};
  }

  async searchRepositories(query: string, options: SearchOptions = {}): Promise<GitHubRepository[]> {
    const cacheKey = `github:search:${query}:${JSON.stringify(options)}`;
    const cached = await cacheGet<GitHubRepository[]>(cacheKey);

    if (cached) {
      logger.info('Returning cached GitHub search results');
      return cached;
    }

    try {
      const response = await withRetry(async () => {
        return await axios.get(`${this.apiBase}/search/repositories`, {
          headers: this.getHeaders(),
          params: {
            q: query,
            sort: options.sort || 'stars',
            order: options.order || 'desc',
            per_page: options.limit || 30,
          },
        });
      });

      const repos = response.data.items.map((repo: any) => this.formatRepository(repo));
      await cacheSet(cacheKey, repos, this.cacheTTL);

      logger.info(`Found ${repos.length} repositories for query: ${query}`);
      return repos;
    } catch (error) {
      logger.error('GitHub search error:', error);
      throw new ExternalAPIError('GitHub', 'Failed to search repositories');
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const cacheKey = `github:repo:${owner}/${repo}`;
    const cached = await cacheGet<GitHubRepository>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await withRetry(async () => {
        return await axios.get(`${this.apiBase}/repos/${owner}/${repo}`, {
          headers: this.getHeaders(),
        });
      });

      const formatted = this.formatRepository(response.data);
      await cacheSet(cacheKey, formatted, this.cacheTTL);

      return formatted;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new ExternalAPIError('GitHub', 'Repository not found');
      }
      logger.error('GitHub repo fetch error:', error);
      throw new ExternalAPIError('GitHub', 'Failed to fetch repository');
    }
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await withRetry(async () => {
        return await axios.get(`${this.apiBase}/repos/${owner}/${repo}/languages`, {
          headers: this.getHeaders(),
        });
      });

      return response.data;
    } catch (error) {
      logger.error('GitHub languages fetch error:', error);
      return {};
    }
  }

  async getRepositoryContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    try {
      const response = await withRetry(async () => {
        return await axios.get(`${this.apiBase}/repos/${owner}/${repo}/contributors`, {
          headers: this.getHeaders(),
          params: { per_page: 10 },
        });
      });

      return response.data.map((contributor: any) => ({
        username: contributor.login,
        contributions: contributor.contributions,
        avatar: contributor.avatar_url,
        profile: contributor.html_url,
      }));
    } catch (error) {
      logger.error('GitHub contributors fetch error:', error);
      return [];
    }
  }

  async getOrganizationInfo(org: string): Promise<GitHubOrganization | null> {
    try {
      const response = await withRetry(async () => {
        return await axios.get(`${this.apiBase}/orgs/${org}`, {
          headers: this.getHeaders(),
        });
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
        avatar: response.data.avatar_url,
      };
    } catch (error) {
      logger.error('GitHub org fetch error:', error);
      return null;
    }
  }

  private formatRepository(repo: any): GitHubRepository {
    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: {
        username: repo.owner.login,
        type: repo.owner.type,
        avatar: repo.owner.avatar_url,
        url: repo.owner.html_url,
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
      license: repo.license ? repo.license.name : null,
    };
  }

  async analyzeRepository(owner: string, repo: string): Promise<GitHubData> {
    const cacheKey = `github:analysis:${owner}/${repo}`;
    const cached = await cacheGet<GitHubData>(cacheKey);

    if (cached) {
      logger.info(`Returning cached analysis for ${owner}/${repo}`);
      return cached;
    }

    try {
      logger.info(`Analyzing repository: ${owner}/${repo}`);

      const repoData = await this.getRepository(owner, repo);
      const [languages, contributors] = await Promise.all([
        this.getRepositoryLanguages(owner, repo),
        this.getRepositoryContributors(owner, repo),
      ]);

      let orgInfo: GitHubOrganization | null = null;
      if (repoData.owner.type === 'Organization') {
        orgInfo = await this.getOrganizationInfo(owner);
      }

      const analysis = this.generateAnalysis(repoData, languages, contributors);

      const result: GitHubData = {
        ...repoData,
        languages,
        contributors,
        organization: orgInfo,
        analysis,
      };

      await cacheSet(cacheKey, result, this.cacheTTL);
      logger.info(`Successfully analyzed ${owner}/${repo}`);

      return result;
    } catch (error) {
      logger.error(`Repository analysis error for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  private generateAnalysis(
    repo: GitHubRepository,
    languages: Record<string, number>,
    contributors: GitHubContributor[]
  ) {
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
      insights: this.generateInsights(repo, activity, popularity),
    };
  }

  private calculateActivity(repo: GitHubRepository): number {
    const daysSinceUpdate = (Date.now() - new Date(repo.pushedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUpdate < 7) return 1.0;
    if (daysSinceUpdate < 30) return 0.8;
    if (daysSinceUpdate < 90) return 0.6;
    if (daysSinceUpdate < 180) return 0.4;
    return 0.2;
  }

  private calculatePopularity(repo: GitHubRepository): number {
    const stars = repo.stars;
    const forks = repo.forks;
    const watchers = repo.watchers;

    const score = Math.min(
      1.0,
      (stars / 1000) * 0.5 + (forks / 100) * 0.3 + (watchers / 500) * 0.2
    );
    return score;
  }

  private generateInsights(repo: GitHubRepository, activity: number, popularity: number): string[] {
    const insights: string[] = [];

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

export default new GitHubScanner();
