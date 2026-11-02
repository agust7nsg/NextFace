import { AnalysisScore, FacialAnalysis, HairstyleOption } from '../types';
import { CelebrityMatch, PersonalizedRecommendation, AgeEstimation } from '../types';

export const mockAnalysisScores: AnalysisScore[] = [
  {
    category: "Symmetry",
    score: 8.5,
    feedback: "Excellent facial balance with minimal asymmetry detected. Your left and right facial halves show strong harmony, particularly in eye positioning and jawline alignment. This natural symmetry is considered highly attractive and contributes significantly to your overall score."
  },
  {
    category: "Jawline",
    score: 7.2,
    feedback: "Well-defined jawline with good angular structure. The jaw-to-face ratio is within ideal proportions, showing masculine definition. Minor improvements could be achieved through targeted facial exercises or professional contouring techniques."
  },
  {
    category: "Eyes",
    score: 9.1,
    feedback: "Exceptional eye area scoring in the top 10% of analyzed faces. Perfect eye spacing ratio (1:1:1), well-defined eye shape, and excellent eyebrow positioning. Your eyes demonstrate ideal proportions and are your strongest facial feature."
  },
  {
    category: "Skin",
    score: 6.8,
    feedback: "Good overall skin condition with minor texture variations detected. Skin tone appears even with minimal blemishes. Recommended improvements include consistent hydration, sun protection, and a targeted skincare routine for enhanced clarity and smoothness."
  },
  {
    category: "Cheekbones",
    score: 7.8,
    feedback: "Well-pronounced cheekbones with good projection and definition. The cheekbone height and width create attractive facial contours. Your cheekbone structure adds dimension and creates appealing shadows that enhance your overall facial aesthetics."
  }
];

export const mockFacialAnalysis: FacialAnalysis = {
  overallScore: 7.9,
  scores: mockAnalysisScores,
  recommendations: [
    "Consider a skincare routine with retinol and vitamin C",
    "Facial exercises can help improve jawline definition",
    "Maintain your current eyebrow shape - it complements your eye area well",
    "Stay hydrated and get adequate sleep for better skin quality",
    "Consider professional grooming for optimal presentation"
  ]
};


export const mockCelebrityMatches: CelebrityMatch[] = [
  {
    name: "Ryan Gosling",
    similarity: 78,
    reason: "Similar facial structure and harmonious proportions in the eye area",
    image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Michael B. Jordan",
    similarity: 72,
    reason: "Comparable facial symmetry and similar jawline definition",
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    name: "Chris Hemsworth",
    similarity: 69,
    reason: "Balanced facial proportions and similar bone structure in cheekbones",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

export const mockPersonalizedRecommendations: PersonalizedRecommendation[] = [
  {
    title: "Nail Care",
    description: "Keep nails clean, trimmed and well-maintained for a polished appearance.",
    priority: "Medium",
    time: "Low",
    cost: "Low",
    difficulty: "Easy",
    category: "grooming"
  },
  {
    title: "Color Coordination",
    description: "Choose clothing colors that complement your skin tone and enhance your natural features.",
    priority: "Medium",
    time: "Medium",
    cost: "Medium",
    difficulty: "Easy",
    category: "style"
  }
];

export const mockAgeEstimation: AgeEstimation = {
  estimatedAge: 22,
  ageRange: "20-24",
  factors: [
    "Skin quality: Excellent",
    "Facial structure: Mature",
    "Eye area: No wrinkles"
  ]
};