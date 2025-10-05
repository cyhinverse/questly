export interface Room {
  id: string;
  quiz_id: string;
  host_id: string;
  created_by: string;
  room_code: string;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  started_at?: string;
  finished_at?: string;
  game_started_at?: string;
  game_redirect_url?: string;
  host_nickname?: string;
}

export interface Player {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  score: number;
  joined_at: string;
  is_ready: boolean;
  quiz_completed: boolean;
  completed_at?: string;
}

export interface CreateRoomData {
  quiz_id: string;
  room_code: string;
  host_id: string;
  created_by: string;
  host_nickname?: string;
}

export interface JoinRoomData {
  room_code: string;
  nickname: string;
}
