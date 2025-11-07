// Core type definitions for Lead Discovery Tool

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: {
    username: string;
    type: string;
    avatar: string;
    url: string;
  };
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  language: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  hasIssues: boolean;
  hasWiki: boolean;
  license: string | null;
}

export interface GitHubContributor {
  username: string;
  contributions: number;
  avatar: string;
  profile: string;
}

export interface GitHubOrganization {
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  email: string | null;
  publicRepos: number;
  followers: number;
  createdAt: string;
  avatar: string;
}

export interface GitHubAnalysis {
  activityScore: number;
  popularityScore: number;
  techStack: string[];
  isActive: boolean;
  isPopular: boolean;
  teamSize: number;
  insights: string[];
}

export interface GitHubData extends GitHubRepository {
  languages: Record<string, number>;
  contributors: GitHubContributor[];
  organization: GitHubOrganization | null;
  analysis: GitHubAnalysis;
}

export interface Technology {
  name: string;
  confidence: number;
  type?: string;
}

export interface TechnologyStack {
  frontend: Technology[];
  backend: Technology[];
  analytics: Technology[];
  hosting: Technology[];
  cms: Technology[];
  ecommerce: Technology[];
  marketing: Technology[];
  security: Technology[];
}

export interface TechnologyData {
  url: string;
  technologies: TechnologyStack;
  confidence: number;
  summary: string[];
  timestamp: string;
}

export interface EmailContact {
  email: string;
  type: 'general' | 'sales' | 'support' | 'personal' | 'admin' | 'unknown';
  confidence: number;
}

export interface SocialMedia {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
}

export interface ContactInfo {
  emails: EmailContact[];
  phones: string[];
  social: SocialMedia;
  linkedin: string | null;
  confidence: number;
}

export interface CompanyProfile {
  domain: string;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  foundedYear: number | null;
  size: string | null;
  email?: string | null;
  createdAt?: string;
  publicRepos?: number;
  followers?: number;
  website: {
    title: string;
    description: string;
    keywords: string[];
  };
  businessModel: string[];
  features: string[];
  socialProof: {
    customers?: string;
    testimonials?: number;
    awards?: number;
    pressMentions?: number;
  };
  metadata: {
    lastAnalyzed: string;
    confidence: number;
  };
}

export interface LeadScoreBreakdown {
  github: number;
  technology: number;
  company: number;
  contact: number;
  engagement: number;
}

export interface LeadScoring {
  totalScore: number;
  grade: string;
  priority: 'high' | 'medium' | 'low' | 'very-low';
  breakdown: LeadScoreBreakdown;
  reasoning: string[];
  confidence: number;
}

export interface Lead {
  id?: string;
  github?: GitHubData;
  technology?: TechnologyData;
  contact?: ContactInfo;
  company?: CompanyProfile;
  scoring: LeadScoring;
  metadata: {
    analyzedAt: string;
    source: string;
    url?: string;
  };
  engagement?: {
    lastUpdate?: string;
    socialActivity?: number;
  };
}

export interface AnalysisRequest {
  github?: string;
  website?: string;
}

export interface SearchOptions {
  sort?: string;
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface JobProgress {
  stage: string;
  percent: number;
  message?: string;
}

export interface AnalysisJobResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: Lead;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  workspaceId?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
