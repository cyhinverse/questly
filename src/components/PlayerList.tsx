import { Player } from '@/types/room';

interface PlayerListProps {
  players: Player[];
  currentUserId?: string;
  showScore?: boolean;
}

export function PlayerList({ players, currentUserId, showScore = false }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No players in room
        </div>
      ) : (
        players.map((player, index) => {
          const isCurrentUser = player.user_id === currentUserId;
          
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isCurrentUser 
                  ? 'bg-purple-50 border-purple-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  isCurrentUser ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  {index + 1}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      isCurrentUser ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {player.nickname}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {player.is_ready ? 'Ready' : 'Waiting'}
                  </div>
                </div>
              </div>
              
              {showScore && (
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {player.score}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
