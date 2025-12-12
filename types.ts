export interface Parameter {
  name: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Abnormal' | 'Critical' | 'Unknown';
  referenceRange: string;
  explanation: string; // Simple explanation of what this parameter is
  implication: string; // What the result implies
}

export interface MedicalAnalysis {
  reportType: string;
  summary: string; // Quick layman summary
  parameters: Parameter[];
  redFlags: string[]; // List of critical items
  lifestyleRecommendations: string[]; // Actionable next steps
  disclaimer: string;
}

export enum AppView {
  HOME = 'HOME',
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  EDUCATION = 'EDUCATION'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}