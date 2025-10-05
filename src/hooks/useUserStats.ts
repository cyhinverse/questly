"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { clearDuplicateQuizPlays, getUniqueQuizPlays } from "@/lib/quizUtils";
import { UserStats } from "@/types/user";

export function useUserStats(userId: string | null) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = async () => {
    if (!userId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch quiz creation stats
      const { data: quizzesCreated, error: quizError } = await supabase
        .from('quiz')
        .select(`
          id,
          title,
          created_at,
          question(count),
          quiz_plays(count)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (quizError) throw quizError;

      // Clear duplicate quiz plays first
      await clearDuplicateQuizPlays(userId);

      // Fetch quiz play stats with correct column names
      const { data: quizPlays, error: playsError } = await supabase
        .from('quiz_plays')
        .select(`
          quiz_id,
          score,
          correct_answers,
          total_questions,
          played_at
        `)
        .eq('user_id', userId)
        .order('played_at', { ascending: false });

      if (playsError) {
        throw playsError;
      }

      // Fetch quiz titles for quiz plays
      const quizIds = [...new Set(quizPlays?.map(play => play.quiz_id) || [])];
      let quizTitles: Record<string, string> = {};
      
      if (quizIds.length > 0) {
        const { data: quizTitlesData, error: titlesError } = await supabase
          .from('quiz')
          .select('id, title')
          .in('id', quizIds);
        
        if (titlesError) throw titlesError;
        quizTitles = quizTitlesData?.reduce((acc, quiz) => {
          acc[quiz.id] = quiz.title;
          return acc;
        }, {} as Record<string, string>) || {};
      }

      // Fetch room creation stats
      let roomsCreated: any[] = [];
      try {
        const { data: roomsCreatedData, error: roomError } = await supabase
          .from('room')
          .select('id')
          .eq('created_by', userId);

        if (roomError) {
          roomsCreated = [];
        } else {
          roomsCreated = roomsCreatedData || [];
        }
      } catch (err) {
        roomsCreated = [];
      }

      // Fetch room participation stats
      let roomsJoined: any[] = [];
      try {
        const { data: roomsJoinedData, error: joinError } = await supabase
          .from('player')
          .select('room_id')
          .eq('user_id', userId);

        if (joinError) {
          roomsJoined = [];
        } else {
          roomsJoined = roomsJoinedData || [];
        }
      } catch (err) {
        roomsJoined = [];
      }

      // Calculate statistics
      const totalQuizzesCreated = quizzesCreated?.length || 0;
      const totalQuizzesPlayed = quizPlays?.length || 0;
      const totalScore = quizPlays?.reduce((sum, play) => sum + (play.score || 0), 0) || 0;
      const averageScore = totalQuizzesPlayed > 0 ? Math.round(totalScore / totalQuizzesPlayed) : 0;
      const bestScore = quizPlays?.reduce((max, play) => Math.max(max, play.score || 0), 0) || 0;
      
      const totalRoomsCreated = roomsCreated?.length || 0;
      const totalRoomsJoined = roomsJoined?.length || 0;

      // Prepare recent quizzes (limit to 5)
      const recentQuizzes = (quizzesCreated || []).slice(0, 5).map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        created_at: quiz.created_at,
        question_count: quiz.question?.[0]?.count || 0,
        play_count: quiz.quiz_plays?.[0]?.count || 0
      }));

      // Prepare recent plays (limit to 5) - remove duplicates
      const uniquePlays = (quizPlays || []).reduce((acc, play) => {
        const key = `${play.quiz_id}-${play.score}-${play.total_questions}-${play.correct_answers}`;
        if (!acc.find(p => p.key === key)) {
          acc.push({ ...play, key });
        }
        return acc;
      }, [] as any[]);

      const recentPlays = uniquePlays.slice(0, 5).map(play => ({
        quiz_id: play.quiz_id,
        quiz_title: quizTitles[play.quiz_id] || 'Unknown Quiz',
        score: play.score || 0,
        correct_answers: play.correct_answers || 0,
        total_questions: play.total_questions || 0,
        played_at: play.played_at
      }));

      const userStats = {
        totalQuizzesCreated,
        totalQuizzesPlayed,
        totalScore,
        averageScore,
        bestScore,
        totalRoomsCreated,
        totalRoomsJoined,
        recentQuizzes,
        recentPlays
      };

      setStats(userStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchUserStats
  };
}
