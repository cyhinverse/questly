"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Quiz,
  Question,
  CreateQuizData,
  CreateQuestionData,
} from "@/types/quiz";

export function useQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách tất cả quiz với thông tin chi tiết (số câu hỏi, số lần chơi)
  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try RPC function first
      const { data, error } = await supabase.rpc("get_quizzes_with_authors");

      if (error) {
        // Fallback to regular query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("quiz")
          .select(
            `
            *,
            question(count),
            quiz_plays(count)
          `
          )
          .order("created_at", { ascending: false });

        if (fallbackError) throw fallbackError;

        // Add author_name as Unknown for fallback
        const fallbackWithAuthors = (fallbackData || []).map((quiz) => ({
          ...quiz,
          author_name: "Unknown",
          question_count: quiz.question?.[0]?.count || 0,
          play_count: quiz.quiz_plays?.[0]?.count || 0,
        }));

        setQuizzes(fallbackWithAuthors);
        return;
      }

      // Sort by created_at descending (newest first)
      const sortedData = (data || []).sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setQuizzes(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy danh sách câu hỏi của một quiz theo thứ tự tạo
  const fetchQuestions = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Query questions của quiz cụ thể, sắp xếp theo thời gian tạo
      const { data, error } = await supabase
        .from("question")
        .select("*")
        .eq("quiz_id", quizId);

      if (error) throw error;
      setQuestions(data || []);
      return { data: data || [], error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch questions";
      setError(errorMessage);
      return { data: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo quiz mới
  const createQuiz = async (quizData: CreateQuizData) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from("quiz")
        .insert([quizData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create quiz";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  // Thêm câu hỏi vào quiz
  const addQuestion = async (questionData: CreateQuestionData) => {
    // Không set loading cho addQuestion để tránh conflict với createQuiz
    setError(null);
    try {
      const { data, error } = await supabase
        .from("question")
        .insert([questionData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add question";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  // Lấy thông tin chi tiết quiz theo ID bao gồm danh sách câu hỏi
  const getQuiz = useCallback(async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Query quiz với join questions để lấy đầy đủ thông tin
      const { data, error } = await supabase
        .from("quiz")
        .select(
          `
          *,
          question(id, content, options, correct_answer)
        `
        )
        .eq("id", quizId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch quiz";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa quiz (chỉ user tạo mới được xóa)
  const deleteQuiz = async (quizId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("quiz").delete().eq("id", quizId);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete quiz";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    quizzes,
    questions,
    loading,
    setLoading,
    error,
    fetchQuizzes,
    fetchQuestions,
    createQuiz,
    addQuestion,
    getQuiz,
    deleteQuiz,
  };
}
