export interface Quiz {
  id: string;
  title: string;
  created_by: string;
  created_at: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  question?: Array<{ count: number }>;
  quiz_plays?: Array<{ count: number }>;
  author_name?: string;
  question_count?: number;
  play_count?: number;
  profiles?: {
    display_name?: string;
    email?: string;
  };
}

export interface Question {
  id: string;
  quiz_id: string;
  content: string;
  options: string[];
  correct_answer: number;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  created_by: string;
}

export interface CreateQuestionData {
  quiz_id: string;
  content: string;
  options: string[];
  correct_answer: number;
}
