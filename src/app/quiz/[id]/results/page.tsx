"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

export default function QuizResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const hasRecordedRef = useRef(false);
  
  const score = searchParams.get("score") || "0";
  const total = searchParams.get("total") || "0";
  const correct = searchParams.get("correct") || "0";
  
  // Get quiz ID from URL
  const quizId = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : null;
  
  const percentage = total !== "0" ? Math.round((parseInt(correct) / parseInt(total)) * 100) : 0;
  
  // Record quiz play when component mounts
  useEffect(() => {
    const recordQuizPlay = async () => {
      if (!quizId || !user || hasRecordedRef.current) return;
      
      try {
        // Check if this quiz play already exists to prevent duplicates
        const { data: existingPlay } = await supabase
          .from('quiz_plays')
          .select('id')
          .eq('quiz_id', quizId)
          .eq('user_id', user.id)
          .eq('score', parseInt(score))
          .eq('total_questions', parseInt(total))
          .eq('correct_answers', parseInt(correct))
          .gte('played_at', new Date(Date.now() - 60000).toISOString()) // Within last minute
          .single();
        
        if (existingPlay) {
          console.log('Quiz play already recorded, skipping duplicate');
          hasRecordedRef.current = true;
          return;
        }
        
        const { error } = await supabase
          .from('quiz_plays')
          .insert({
            quiz_id: quizId,
            user_id: user.id,
            score: parseInt(score),
            total_questions: parseInt(total),
            correct_answers: parseInt(correct)
          });
        
        if (error) {
          console.error('Error recording quiz play:', error);
        } else {
          console.log('Quiz play recorded successfully');
          hasRecordedRef.current = true;
        }
      } catch (err) {
        console.error('Error in recordQuizPlay:', err);
      }
    };
    
    recordQuizPlay();
  }, [quizId, user, score, total, correct]);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Excellent! 🎉";
    if (percentage >= 70) return "Good job! 👍";
    if (percentage >= 50) return "Not bad! 💪";
    return "Keep practicing! 📚";
  };

  const getPerformanceColor = () => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBgColor = () => {
    if (percentage >= 90) return "bg-green-50 border-green-200";
    if (percentage >= 70) return "bg-blue-50 border-blue-200";
    if (percentage >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6 text-center">
          <h1 className="text-4xl font-bold text-black mb-2">Quiz Complete!</h1>
          <p className="text-lg text-gray-600">Here are your results</p>
        </div>

        {/* Results */}
        <div className={`rounded-2xl shadow-sm border p-8 mb-6 ${getPerformanceBgColor()}`}>
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold ${getPerformanceColor()} mb-4`}>
              {percentage}%
            </div>
            <div className="text-2xl font-semibold text-gray-800 mb-2">
              {getPerformanceMessage()}
            </div>
            <div className="text-lg text-gray-600">
              You got {correct} out of {total} questions correct
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">{score}</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">{correct}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-gray-800">{parseInt(total) - parseInt(correct || '0')}</div>
              <div className="text-sm text-gray-600">Incorrect Answers</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="px-8 py-3"
            onClick={() => {
              // Retake the same quiz
              const quizId = window.location.pathname.split('/')[2];
              router.push(`/quiz/${quizId}`);
            }}
          >
            Retake Quiz
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3"
            onClick={() => router.push("/quiz")}
          >
            Browse More Quizzes
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
