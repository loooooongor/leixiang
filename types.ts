
export interface LeixiangItem {
  id: string;
  category: string;
  subCategory?: string;
  name: string;
  meanings: string[];
  extra?: string;
}

export interface Progress {
  itemId: string;
  box: number; // For Leitner system (0-4)
  nextReview: number;
  lastReview: number;
}

export type AppMode = 'LEARN' | 'QUIZ' | 'BROWSE';

export interface CategoryGroup {
  id: string;
  label: string;
}
