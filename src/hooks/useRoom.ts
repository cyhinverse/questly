"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Room, Player, CreateRoomData, JoinRoomData } from "@/types/room";

export function useRoom() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Tạo room mới
  const createRoom = async (roomData: CreateRoomData) => {
    setLoading(true);
    setError(null);
    try {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('room')
        .insert([roomData])
        .select()
        .single();
      
      if (roomError) throw roomError;
      
      // Thêm host làm player đầu tiên trong room
      const { data: player, error: playerError } = await supabase
            .from('player')
            .insert([{
              room_id: room.id,
              user_id: roomData.host_id,
              nickname: room.host_nickname || 'Host',  // Sử dụng nickname từ room data
              score: 0,                 // Điểm số ban đầu
              is_ready: false,         // Host cũng cần bấm ready
              quiz_completed: false    // Chưa hoàn thành quiz
            }])
            .select()
            .single();
      
      if (playerError) {
        // Không throw error vì room đã tạo thành công
      }
      
      setCurrentRoom(room);
      return { data: room, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin room theo ID
  const fetchRoom = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Query room từ database theo ID
      const { data, error } = await supabase
        .from('room')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error) throw error;
      setCurrentRoom(data);  // Cập nhật current room state
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch room';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Join room bằng room code
  const joinRoom = async (joinData: JoinRoomData) => {
    setLoading(true);
    setError(null);
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Tìm room bằng room code
      const { data: room, error: roomError } = await supabase
        .from('room')
        .select('*')
        .eq('room_code', joinData.room_code)
        .eq('status', 'waiting')
        .single();
      
      if (roomError) throw roomError;
      if (!room) throw new Error('Room not found or not available');

      // Kiểm tra xem user có phải là host không
      const isHost = room.host_id === user.id;
      let player;
      
      if (isHost) {
        // Host không nên join room, chỉ cần redirect đến room page
        // Nếu host đã có player record, không cần làm gì
        const { data: hostPlayer, error: hostError } = await supabase
          .from('player')
          .select('*')
          .eq('room_id', room.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (hostError) {
          throw hostError;
        }

        if (hostPlayer) {
          // Host đã có player record, không cần join
          player = hostPlayer;
        } else {
          // Host chưa có player record (trường hợp hiếm), tạo mới
          const { data: newHostPlayer, error: createHostError } = await supabase
            .from('player')
            .insert([{
              room_id: room.id,
              user_id: user.id,
              nickname: room.host_nickname || 'Host',
              score: 0,
              is_ready: true,
              quiz_completed: false
            }])
            .select()
            .single();

          if (createHostError) throw createHostError;
          player = newHostPlayer;
        }
      } else {
        // Nếu không phải host, kiểm tra player đã tồn tại chưa
        const { data: existingPlayer, error: checkError } = await supabase
          .from('player')
          .select('*')
          .eq('room_id', room.id)
          .eq('user_id', user.id)
          .maybeSingle();

        let shouldCreateNew = false;
        
        // Nếu có lỗi kiểm tra (như multiple players), cleanup duplicates trước
        if (checkError && checkError.code === 'PGRST116') {
          await supabase
            .from('player')
            .delete()
            .eq('room_id', room.id)
            .eq('user_id', user.id);
          shouldCreateNew = true;
        }
        
        if (existingPlayer && !shouldCreateNew) {
          // Player đã tồn tại, cập nhật nickname nhưng giữ nguyên ready status
          const { data: updatedPlayer, error: playerError } = await supabase
            .from('player')
            .update({
              nickname: joinData.nickname
            })
            .eq('id', existingPlayer.id)
            .select()
            .single();

          if (playerError) throw playerError;
          player = updatedPlayer;
        } else {
          // Thêm player mới vào room
          const { data: newPlayer, error: playerError } = await supabase
            .from('player')
            .insert([{
              room_id: room.id,
              user_id: user.id,
              nickname: joinData.nickname,
              score: 0,
              is_ready: false,  // Player mới join sẽ chưa ready
              quiz_completed: false
            }])
            .select()
            .single();

          if (playerError) throw playerError;
          player = newPlayer;
        }
      }
      
      setCurrentRoom(room);
      return { data: { room, player }, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join room';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách players trong room theo thứ tự join
  const fetchPlayers = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Query players của room cụ thể, sắp xếp theo thời gian join
      const { data, error } = await supabase
        .from('player')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });
      
      if (error) throw error;
      setPlayers(data || []);
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch players';
      setError(errorMessage);
      return { data: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime changes for players trong room
  const subscribeToPlayers = useCallback((roomId: string) => {
    // Tạo realtime channel để lắng nghe thay đổi trong bảng player
    const channel = supabase
      .channel(`room-${roomId}-players`)
      .on(
        'postgres_changes',
        {
          event: '*',                    // Lắng nghe tất cả events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'player',
          filter: `room_id=eq.${roomId}`  // Chỉ lắng nghe players của room này
        },
        (payload) => {
          // Khi có thay đổi, refresh danh sách players
          fetchPlayers(roomId).then(({ data }) => {
            if(data) {
              setPlayers(data);
            }
          });
        }
      )
      .subscribe((status, err) => {
        if (err) {
        }
      });

    return channel;
  }, [fetchPlayers]);

  // Subscribe to realtime changes for room status
  const subscribeToRoom = useCallback((roomId: string) => {
    
    const channel = supabase
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
          }
        }
      )
      .subscribe((status,error) => {
        if(status === 'SUBSCRIBED'){
          setRealtimeStatus('connected');
        }else if(status === 'CHANNEL_ERROR'){
          setRealtimeStatus('disconnected');
        }
        if(error){
          throw new Error("Error from  subscribeToRoom",error)
        }
      });

    return channel;
  }, []);

  // Bắt đầu game
  const startGame = async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError;
      }
      
      // Check room data first
      const { data: roomData, error: roomError } = await supabase
        .from('room')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (roomError) {
        throw roomError;
      }
      
      
      const { data, error } = await supabase
        .from('room')
        .update({ 
          status: 'playing'
        })
        .eq('id', roomId)
        .select();
      
      if (error) throw error;
      
      // Broadcast game start tới tất cả players qua realtime
      const redirectUrl = `/quiz/${roomData.quiz_id}?room=${roomId}`;
      
      const { error: broadcastError } = await supabase
        .from('room')
        .update({ 
          game_started_at: new Date().toISOString(),
          game_redirect_url: redirectUrl
        })
        .eq('id', roomId);
      
      if (broadcastError) {
      }
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Kết thúc game
  const finishGame = async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('room')
        .update({ 
          status: 'finished',
          finished_at: new Date().toISOString()
        })
        .eq('id', roomId);
      
      if (error) throw error;
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to finish game';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật điểm số player
  const updatePlayerScore = async (roomId: string, userId: string, score: number) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('player')
        .update({ score })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update player score';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu player đã hoàn thành quiz
  const markPlayerCompleted = async (roomId: string, userId: string, score: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('player')
        .update({ 
          score,
          quiz_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark player completed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Rời khỏi room với realtime updates
  const leaveRoom = async (roomId: string, playerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // If playerId provided, delete by ID, otherwise delete by user_id
      let deleteQuery = supabase.from('player').delete();
      
      if (playerId) {
        deleteQuery = deleteQuery.eq('id', playerId);
      } else {
        deleteQuery = deleteQuery.eq('user_id', user.id).eq('room_id', roomId);
      }

      const { error } = await deleteQuery;
      
      if (error) throw error;
      
      // Realtime sẽ tự động cập nhật danh sách players thông qua subscribeToPlayers
      // Không cần gọi fetchPlayers() vì realtime subscription đã handle
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave room';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    players,
    currentRoom,
    setCurrentRoom,
    loading,
    error,
    createRoom,
    fetchRoom,
    joinRoom,
    fetchPlayers,
    subscribeToPlayers,
    subscribeToRoom,
    startGame,
    finishGame,
    updatePlayerScore,
    markPlayerCompleted,
    leaveRoom,
  };
}
