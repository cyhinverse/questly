"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuiz } from "@/hooks/useQuiz";
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from "@/hooks/useRoom";

export default function PlayQuiz() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getQuiz, fetchQuestions, questions, loading } = useQuiz();
  const { user } = useAuth();
  const { markPlayerCompleted } = useRoom();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: number; isCorrect: boolean }>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Check if this is a room game
  const roomId = searchParams.get('room');
  const isRoomGame = !!roomId;

  const quizId = params.id as string;

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(30); // Reset timer for each question
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      // Time's up, move to next question
      handleNextQuestion().catch(() => {});
    }
  }, [timeLeft, quizCompleted]);

  const loadQuiz = async () => {
    const { data: quizData, error } = await getQuiz(quizId);
    if (quizData) {
      setQuiz(quizData);
      await fetchQuestions(quizId);
    } else {
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || quizCompleted) return;
    
    setSelectedAnswer(answerIndex);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    
    // Save answer
    const newAnswer = {
      questionId: currentQuestion.id,
      answer: answerIndex,
      isCorrect
    };
    setAnswers([...answers, newAnswer]);
    
    // Update score
    if (isCorrect) {
      setScore(score + 100);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      
      // Mark player as completed and update score if this is a room game
      if (isRoomGame && roomId && user) {
        try {
          await markPlayerCompleted(roomId, user.id, score);
        } catch (error) {
        }
      }
      
      // Redirect based on game type
      setTimeout(() => {
        if (isRoomGame && roomId) {
          // Redirect to room leaderboard
          router.push(`/room/leaderboard?room=${roomId}`);
        } else {
          // Redirect to solo results
          router.push(`/quiz/${quizId}/results?score=${score}&total=${questions.length}&correct=${answers.filter(a => a.isCorrect).length}`);
        }
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <LoadingSpinner size="lg" text="Loading quiz..." />
        </div>
      </div>
    );
  }

  if (!loading && (!quiz || questions.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-900 text-xl mb-4">Quiz not found</div>
          <Button onClick={() => router.push("/quiz")} variant="primary">
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Quiz Completed!</h1>
          <div className="text-2xl font-bold text-black mb-2">Score: {score}</div>
          <div className="text-lg text-gray-700 mb-6">
            {answers.filter(a => a.isCorrect).length} / {questions.length} correct
          </div>
          <div className="text-gray-500">Redirecting to results...</div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black">{quiz.title}</h1>
              <p className="text-gray-700">{quiz.description || "Test your knowledge"}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="text-2xl font-bold text-black">{timeLeft}s</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question */}
          <div className="lg:col-span-2">
            <QuestionCard
              question={currentQuestion.content}
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correct_answer}
              timeLeft={timeLeft}
              onAnswer={handleAnswer}
              selectedAnswer={selectedAnswer}
              showResult={selectedAnswer !== null}
            />
            
            {selectedAnswer !== null && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => handleNextQuestion().catch(() => {})}
                  variant="primary"
                  className="px-8"
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </div>
            )}
          </div>

          {/* Score & Stats */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-center text-black">Your Progress</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-black">{score}</div>
                <div className="text-sm text-gray-500">Current Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">
                  {answers.filter(a => a.isCorrect).length} / {questions.length}
                </div>
                <div className="text-sm text-gray-500">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-black">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-gray-500">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
