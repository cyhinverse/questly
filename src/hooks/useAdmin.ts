"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./useAuth";

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalPlays: number;
  totalRooms: number;
  recentUsers: Array<{
    id: string;
    email: string;
    created_at: string;
  }>;
  recentQuizzes: Array<{
    id: string;
    title: string;
    created_at: string;
    play_count: number;
  }>;
}

export function useAdmin() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'admin@questly.com';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      const [
        usersResult,
        quizzesResult,
        playsResult,
        roomsResult,
        recentUsersResult,
        recentQuizzesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('quiz').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('quiz_plays').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('room').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('profiles').select('id, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('quiz').select('id, title, created_at, play_count').order('created_at', { ascending: false }).limit(5)
      ]);

      if (usersResult.error || quizzesResult.error || playsResult.error || roomsResult.error) {
        throw new Error('Failed to fetch admin stats');
      }

      setStats({
        totalUsers: usersResult.count,
        totalQuizzes: quizzesResult.count,
        totalPlays: playsResult.count,
        totalRooms: roomsResult.count,
        recentUsers: recentUsersResult.data || [],
        recentQuizzes: recentQuizzesResult.data || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const toggleQuizStatus = async (quizId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('quiz')
        .update({ is_published: isPublished })
        .eq('id', quizId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase
        .from('quiz')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' };
    }
  };

  return {
    isAdmin,
    stats,
    loading,
    error,
    fetchAdminStats,
    updateUserRole,
    toggleUserStatus,
    toggleQuizStatus,
    deleteQuiz
  };
}
