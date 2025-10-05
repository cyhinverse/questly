"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRoom } from "@/hooks/useRoom";
import { useQuiz } from "@/hooks/useQuiz";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Room } from "@/types/room";
import { useToastHelpers } from "@/components/ErrorMessage";

export default function RoomGame() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const { 
    currentRoom, 
    setCurrentRoom,
    players, 
    fetchRoom,
    fetchPlayers, 
    subscribeToPlayers, 
    subscribeToRoom, 
    startGame, 
    leaveRoom,
    loading 
  } = useRoom();
  const { getQuiz, fetchQuestions, questions } = useQuiz();
  const { user } = useAuth();
  const { success, error: showError } = useToastHelpers();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isReady, setIsReady] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);

  // Check if all players are ready
  const allPlayersReady = players.length >= 2 && players.every(player => player.is_ready);
  
  // Debug: Log ready status
  console.log('=== READY STATUS DEBUG ===');
  console.log('Players:', players.map(p => ({ nickname: p.nickname, is_ready: p.is_ready })));
  console.log('All players ready:', allPlayersReady);
  console.log('Players count:', players.length);
  console.log('========================');

  useEffect(() => {
    if (roomId && user) {
      loadRoomData();
    }
  }, [roomId, user]);

  useEffect(() => {
    if (roomId) {
      
      // Subscribe to realtime updates directly
      const playerChannel = supabase
        .channel(`room-${roomId}-players`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'player',
            filter: `room_id=eq.${roomId}`
          },
        (payload) => {
          // Refresh players list
          fetchPlayers(roomId).then(({ data, error }) => {
            if (error) {
            } else if (data) {
              // Update ready state for current user
              if (user) {
                const currentPlayer = data.find(p => p.user_id === user.id);
                if (currentPlayer) {
                  console.log('=== REALTIME UPDATE ===');
                  console.log('Current player:', currentPlayer);
                  console.log('Ready status:', currentPlayer.is_ready);
                  console.log('Player nickname:', currentPlayer.nickname);
                  console.log('=======================');
                  setIsReady(currentPlayer.is_ready);
                  setPlayerId(currentPlayer.id);
                }
              }
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
          }
        });

      const roomChannel = supabase
        .channel(`room-${roomId}-status`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'room',
            filter: `id=eq.${roomId}`
          },
          (payload) => {
            if (payload.new) {
              setCurrentRoom(payload.new as Room);
              
              // Auto-redirect tất cả players khi game bắt đầu
              const roomData = payload.new as Room;
              if (roomData.status === 'playing' && roomData.game_redirect_url) {
                setGameStarting(true);
                // Delay 2 giây để hiển thị trạng thái "Game Starting"
                setTimeout(() => {
                  if (roomData.game_redirect_url) {
                    router.push(roomData.game_redirect_url);
                  }
                }, 2000);
              }
            }
          }
        )
        .subscribe((status, err) => {
          // Cập nhật trạng thái kết nối realtime
          if (err) {
          }
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setRealtimeStatus('disconnected');
          }
        });
      
      return () => {
        // Cleanup realtime subscriptions khi component unmount
        playerChannel?.unsubscribe();
        roomChannel?.unsubscribe();
      };
    }
  }, [roomId, fetchPlayers]); // Include fetchPlayers dependency

  // Re-check host status when user or currentRoom changes
  useEffect(() => {
    if (user && currentRoom) {
      const isUserHost = currentRoom.host_id === user.id;
      
      if (isUserHost !== isHost) {
        setIsHost(isUserHost);
      }
    }
  }, [user, currentRoom, isHost]);

  const loadRoomData = async () => {
    
    // Fetch room data first
    const { data: roomData, error: roomError } = await fetchRoom(roomId);
    
    
    if (roomError || !roomData) {
      return;
    }
    
    // Fetch players and wait for the result
    const { data: playersData, error: playersError } = await fetchPlayers(roomId);
    
    console.log('=== LOAD ROOM DATA ===');
    console.log('User ID:', user?.id);
    console.log('Players data from fetchPlayers:', playersData);
    console.log('Players error:', playersError);
    
    // Set initial ready state for current user
    if (user && playersData) {
      const currentPlayer = playersData.find(p => p.user_id === user.id);
      console.log('Found current player:', currentPlayer);
      
      if (currentPlayer) {
        console.log('Ready status:', currentPlayer.is_ready);
        console.log('Player nickname:', currentPlayer.nickname);
        console.log('Player ID:', currentPlayer.id);
        setIsReady(currentPlayer.is_ready);
        setPlayerId(currentPlayer.id);
      } else {
        console.log('ERROR: No player found for current user');
        console.log('Available players:', playersData.map(p => ({ id: p.id, user_id: p.user_id, nickname: p.nickname })));
        
        // Fallback: Try to get playerId directly from database
        console.log('Trying fallback method...');
        try {
          const { data: fallbackPlayer, error: fallbackError } = await supabase
            .from('player')
            .select('id, is_ready')
            .eq('room_id', roomId)
            .eq('user_id', user.id)
            .single();
          
          if (fallbackPlayer && !fallbackError) {
            console.log('Fallback successful:', fallbackPlayer);
            setPlayerId(fallbackPlayer.id);
            setIsReady(fallbackPlayer.is_ready);
          } else {
            console.log('Fallback failed:', fallbackError);
          }
        } catch (err) {
          console.log('Fallback error:', err);
        }
      }
    }
    console.log('========================');
    
    // Check if current user is host
    if (roomData && user) {
      const isUserHost = roomData.host_id === user.id;
      setIsHost(isUserHost);
    }
    
    // Get quiz info
    if (roomData) {
      const { data: quizData } = await getQuiz(roomData.quiz_id);
      if (quizData) {
        setQuiz(quizData);
        await fetchQuestions(roomData.quiz_id);
      }
    }
  };

  const handleStartGame = async () => {
    if (!isHost) {
      return;
    }
    
    
    const { error } = await startGame(roomId);
    if (error) {
      showError(`Bắt đầu game thất bại: ${error}`);
      return;
    }
    
    
    // Show game starting state for host too
    setGameStarting(true);
    
    // Redirect to quiz play page after delay
    setTimeout(() => {
      if (currentRoom?.quiz_id) {
        router.push(`/quiz/${currentRoom.quiz_id}?room=${roomId}`);
      }
    }, 2000);
  };

  const handleToggleReady = async () => {
    console.log('=== TOGGLE READY BUTTON CLICKED ===');
    console.log('User:', user);
    console.log('PlayerId:', playerId);
    console.log('Current isReady state:', isReady);
    
    if (!user || !playerId) {
      console.log('ERROR: Missing user or playerId');
      console.log('User exists:', !!user);
      console.log('PlayerId exists:', !!playerId);
      return;
    }
    
    const newReadyState = !isReady;
    
    console.log('New ready state:', newReadyState);
    console.log('===================================');
    
    try {
      console.log('Updating database with playerId:', playerId, 'and is_ready:', newReadyState);
      
      const { data, error } = await supabase
        .from('player')
        .update({ is_ready: newReadyState })
        .eq('id', playerId)
        .select();
      
      console.log('Database response:', { data, error });
      
      if (error) {
        console.log('Database update error:', error);
        showError(`Cập nhật trạng thái sẵn sàng thất bại: ${error.message}`);
        return;
      }
      
      console.log('Database update successful, setting local state to:', newReadyState);
      setIsReady(newReadyState);
    } catch (err) {
      console.log('Toggle ready error:', err);
      showError('Cập nhật trạng thái sẵn sàng thất bại');
    }
  };

  const handleLeaveRoom = async () => {
    const { error } = await leaveRoom(roomId);
    
    if (error) {
      showError(`Rời phòng thất bại: ${error}`);
      return;
    }
    
    router.push("/room/lobby");
  };

  // Show game starting state
  if (gameStarting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-pulse">
                <div className="text-6xl mb-4">🎮</div>
                <h1 className="text-3xl font-bold text-purple-600 mb-4">Game Starting!</h1>
                <p className="text-gray-600 mb-6">Redirecting to quiz in 2 seconds...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !currentRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {loading ? (
            <LoadingSpinner size="lg" text="Loading room..." />
          ) : (
            <>
              <div className="text-gray-900 text-xl mb-4">Room not found</div>
              <Button onClick={() => router.push("/room/lobby")} variant="primary">
                Back to Lobby
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz?.title || "Loading..."}</h1>
              <p className="text-gray-600">Room Code: {currentRoom.room_code}</p>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                currentRoom.status === 'waiting' ? 
                  (players.length >= 2 ? 'text-green-600' : 'text-yellow-600') :
                currentRoom.status === 'playing' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {currentRoom.status === 'waiting' ? 
                  (players.length >= 2 ? 'Ready to Start' : 'Waiting for Players') :
                 currentRoom.status === 'playing' ? 'Game in Progress' :
                 currentRoom.status === 'finished' ? 'Game Finished' :
                 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quiz Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <span className="font-medium capitalize">{quiz?.difficulty || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">{players.length}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {isHost && currentRoom.status === 'waiting' && (
                <>
                  <Button 
                    onClick={handleToggleReady}
                    variant={isReady ? "secondary" : "primary"}
                    className="w-full"
                  >
                    {isReady ? "Not Ready" : "Ready"}
                  </Button>
                  
                  <Button 
                    onClick={handleStartGame}
                    variant="primary"
                    className="w-full"
                    disabled={players.length < 2 || !allPlayersReady}
                  >
                    {players.length < 2 ? "Waiting for players..." : 
                     !allPlayersReady ? "All players must be ready" : "Start Game"}
                  </Button>
                </>
              )}
              
              {!isHost && currentRoom.status === 'waiting' && (
                <Button 
                  onClick={handleToggleReady}
                  variant={isReady ? "secondary" : "primary"}
                  className="w-full"
                >
                  {isReady ? "Not Ready" : "Ready"}
                </Button>
              )}
            </div>
          </div>

          {/* Players List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Players ({players.length})</h2>
              <div className="text-xs text-gray-500">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  realtimeStatus === 'connected' ? 'bg-green-500' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></span>
                {realtimeStatus === 'connected' ? 'Connected' :
                 realtimeStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </div>
            </div>
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {player.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{player.nickname}</div>
                      <div className="text-xs text-gray-500">
                        {player.is_ready ? 'Ready' : 'Not Ready'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {player.user_id === currentRoom.host_id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Host</span>
                    )}
                    {player.user_id === user?.id && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">You</span>
                    )}
                    {player.is_ready && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleLeaveRoom}
                variant="outline"
                className="w-full"
              >
                Leave Room
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
