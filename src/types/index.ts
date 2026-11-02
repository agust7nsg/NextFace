export interface AnalysisScore {
  category: string;
  score: number;
  feedback: string;
}

export interface FacialAnalysis {
  overallScore: number;
  scores: Array<{ key: string; label: string; score: number; raw?: number }>;
  symmetry: number;
  attractiveness: number;
  age: number;
  recommendations: string[];
}


export interface CelebrityMatch {
  name: string;
  similarity: number;
  reason: string;
  image?: string;
}

export interface PersonalizedRecommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  cost: string;
  difficulty: string;
  category: string;
}

export interface AgeEstimation {
  estimatedAge: number;
  ageRange: string;
  factors: string[];
}