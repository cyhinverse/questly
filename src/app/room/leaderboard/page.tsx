"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRoom } from '@/hooks/useRoom';
import { useQuiz } from '@/hooks/useQuiz';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/lib/supabaseClient';

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('room');
  
  const { 
    currentRoom, 
    players, 
    fetchRoom,
    fetchPlayers, 
    finishGame,
    loading 
  } = useRoom();
  const { getQuiz, fetchQuestions } = useQuiz();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<{ id: string; title: string; question?: Array<{ id: string; content: string; options: string[]; correct_answer: number }> } | null>(null);
  const [sortedPlayers, setSortedPlayers] = useState<Array<{ id: string; user_id: string; nickname: string; score: number; quiz_completed: boolean; completed_at?: string }>>([]);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load room and quiz data
  const loadData = useCallback(async () => {
    if (!roomId) return;
    
    try {
      // Fetch room data
      const { data: roomData } = await fetchRoom(roomId);
      if (roomData) {
        // Fetch quiz data với thông tin câu hỏi
        const { data: quizData } = await getQuiz(roomData.quiz_id);
        if (quizData) {
          // Nếu không có questions trong quiz data, fetch riêng
          const quizWithQuestions = quizData as { id: string; title: string; question?: Array<{ id: string; content: string; options: string[]; correct_answer: number }> };
          if (!quizWithQuestions.question || quizWithQuestions.question.length === 0) {
            const { data: questionsData } = await fetchQuestions(roomData.quiz_id);
            if (questionsData) {
              // Gán questions vào quiz data
              quizWithQuestions.question = questionsData;
            }
          }
          
          setQuiz(quizWithQuestions);
        }
      }
      
      // Fetch players và sắp xếp theo điểm số
      const { data: playersData } = await fetchPlayers(roomId);
      if (playersData) {
        // Sắp xếp players theo điểm số giảm dần (cao nhất lên đầu)
        const sorted = [...playersData].sort((a, b) => b.score - a.score);
        setSortedPlayers(sorted);
      }
    } catch (error) {
    }
  }, [roomId, fetchRoom, fetchPlayers, getQuiz]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to realtime updates for players
  useEffect(() => {
    if (!roomId) return;
    
    const playerChannel = supabase
      .channel(`room-${roomId}-players-leaderboard`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'player',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setIsUpdating(true);
          setLastUpdate(new Date());
          // Refresh players list when any player data changes
          fetchPlayers(roomId).then(({ data }) => {
            if (data) {
              const sorted = [...data].sort((a, b) => b.score - a.score);
              setSortedPlayers(sorted);
              // Reset updating state after a short delay
              setTimeout(() => setIsUpdating(false), 1000);
            }
          });
        }
      )
      .subscribe((status, err) => {
        if (err) {
          setRealtimeStatus('disconnected');
        }
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
        } else if (status === 'TIMED_OUT') {
          setRealtimeStatus('disconnected');
        } else if (status === 'CLOSED') {
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      playerChannel?.unsubscribe();
    };
  }, [roomId, fetchPlayers]);

  const handlePlayAgain = () => {
    if (currentRoom?.quiz_id) {
      router.push(`/quiz/${currentRoom.quiz_id}?room=${roomId}`);
    }
  };

  const handleBackToLobby = () => {
    router.push('/room/lobby');
  };

  const handleFinishGame = async () => {
    if (!roomId) return;
    
    try {
      await finishGame(roomId);
    } catch (error) {
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 pt-20">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <LoadingSpinner size="lg" text="Loading leaderboard..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no room
  if (!roomId || !currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-400 mb-4">No game found</h1>
              <Button
                onClick={handleBackToLobby}
                variant="primary"
                className="px-6 py-3"
              >
                Back to Lobby
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Leaderboard</h1>
            <p className="text-gray-600 mb-4">
              {quiz?.title || 'Quiz Game'} - Live Results
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
              <span>
                Room Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{currentRoom.room_code}</span>
              </span>
              <div className="flex items-center gap-1">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  realtimeStatus === 'connected' ? 'bg-green-500' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></span>
                <span className="text-xs">
                  {realtimeStatus === 'connected' ? 'Live' :
                   realtimeStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </span>
                {lastUpdate && (
                  <span className="text-xs text-gray-400 ml-2">
                    • Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Players Ranking */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 mb-6 transition-all duration-500 ${
            isUpdating ? 'ring-2 ring-green-400 shadow-green-200' : ''
          }`}>
            <div className="flex justify-center items-center gap-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Live Rankings</h2>
              {isUpdating && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Updating...</span>
                </div>
              )}
            </div>
            
            {sortedPlayers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No players found
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPlayers.map((player, index) => {
                  const isCurrentUser = player.user_id === user?.id;
                  const isHost = player.user_id === currentRoom.host_id;
                  
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        index === 0 
                          ? 'bg-yellow-50 border-yellow-300 shadow-lg' 
                          : index === 1 
                          ? 'bg-gray-50 border-gray-300 shadow-md'
                          : index === 2
                          ? 'bg-orange-50 border-orange-300 shadow-sm'
                          : 'bg-white border-gray-200'
                      } ${isCurrentUser ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      {/* Rank */}
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${isCurrentUser ? 'text-purple-600' : 'text-gray-800'}`}>
                              {player.nickname}
                            </span>
                            {isHost && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                Host
                              </span>
                            )}
                            {isCurrentUser && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                            {player.quiz_completed && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {player.score} {player.score === 1 ? 'point' : 'points'}
                            {player.quiz_completed && player.completed_at && (
                              <span className="ml-2 text-xs text-gray-400">
                                • {new Date(player.completed_at).toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">
                          {player.score}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quiz?.question && quiz.question.length > 0 
                            ? Math.round((player.score / (quiz.question.length * 100)) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePlayAgain}
              variant="primary"
              className="px-8 py-3"
            >
              🎮 Play Again
            </Button>
            
            <Button
              onClick={handleBackToLobby}
              variant="secondary"
              className="px-8 py-3"
            >
              🏠 Back to Lobby
            </Button>
            
            {user?.id === currentRoom.host_id && (
              <Button
                onClick={handleFinishGame}
                variant="outline"
                className="px-8 py-3"
              >
                🏁 Finish Game
              </Button>
            )}
          </div>

          {/* Game Stats */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Game Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{sortedPlayers.length}</div>
                <div className="text-sm text-gray-500">Total Players</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sortedPlayers.filter(p => p.quiz_completed).length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {quiz?.question?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {sortedPlayers.length > 0 ? Math.max(...sortedPlayers.map(p => p.score)) : 0}
                </div>
                <div className="text-sm text-gray-500">Highest Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {sortedPlayers.length > 0 ? Math.round(sortedPlayers.reduce((sum, p) => sum + p.score, 0) / sortedPlayers.length) : 0}
                </div>
                <div className="text-sm text-gray-500">Average Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
      <LeaderboardContent />
    </Suspense>
  );
}