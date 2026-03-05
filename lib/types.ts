/**
 * API Request/Response types for resume enhancement
 */

export interface EnhanceRequest {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  strictTruthMode: boolean;
}

export interface EnhanceResponse {
  summaryBullets: string[];
  skills: string[];
  keywordsReport: KeywordsReport;
  meta?: {
    jobTitle: string;
    strictTruthMode: boolean;
  };
}

export interface KeywordsReport {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface KeywordMatch {
  keyword: string;
  frequency: number;
  found: boolean;
}

export interface ResumePart {
  title: string;
  content: string;
}
