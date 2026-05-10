export interface CowBreedAnalysis {
  breed: string;
  confidence: number;
  description: string;
  nutrition: string;
  healthCare: string;
  conversionRate: string;
}

export interface Feedback {
  rating: number;
  comment: string;
  breed?: string;
  date: Date;
}
