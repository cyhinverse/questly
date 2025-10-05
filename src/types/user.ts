export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UserStats {
  // Quiz statistics
  totalQuizzesCreated: number;
  totalQuizzesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  
  // Room statistics
  totalRoomsCreated: number;
  totalRoomsJoined: number;
  
  // Recent activity
  recentQuizzes: Array<{
    id: string;
    title: string;
    created_at: string;
    question_count: number;
    play_count: number;
  }>;
  
  recentPlays: Array<{
    quiz_id: string;
    quiz_title: string;
    score: number;
    correct_answers: number;
    total_questions: number;
    played_at: string;
  }>;
}

export interface UpdateUserData {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}
