"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { QuizCard } from "@/components/QuizCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useQuiz } from "@/hooks/useQuiz";
import { useAuth } from "@/hooks/useAuth";

export default function QuizList() {
  const { quizzes, fetchQuizzes, loading } = useQuiz();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);


  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "bg-emerald-500";
      case "medium": return "bg-amber-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case "easy": return "Easy";
      case "medium": return "Medium";
      case "hard": return "Hard";
      default: return "Unknown";
    }
  };

  // Memoized filtered quizzes for better performance
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      // Basic validation - skip quizzes with empty or invalid data
      if (!quiz.title || quiz.title.trim() === "") {
        return false;
      }
      
      // Filter by user (all/my)
      const userMatch = filter === "my" && user 
        ? quiz.created_by === user.id 
        : true;
      
      // Filter by search query - only search in title and description
      const searchMatch = debouncedSearchQuery.trim() === "" 
        ? true 
        : (() => {
            const query = debouncedSearchQuery.toLowerCase().trim();
            const title = quiz.title.toLowerCase().trim();
            const description = (quiz.description || "").toLowerCase().trim();
            
            
            // Smart search: partial match but avoid single character false positives
            const isSingleChar = query.length === 1;
            
            if (isSingleChar) {
              // For single characters, only match if it's a whole word or at word boundary
              const createWordBoundaryRegex = (searchQuery: string) => {
                const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                return new RegExp(`\\b${escapedQuery}\\b`, 'i');
              };
              
              const wordRegex = createWordBoundaryRegex(query);
              const titleMatch = wordRegex.test(title);
              const descriptionMatch = wordRegex.test(description);
              
              return titleMatch || descriptionMatch;
            } else {
              // For multi-character queries, allow partial matches
              const titleMatch = title.includes(query);
              const descriptionMatch = description.includes(query);
              
              
              return titleMatch || descriptionMatch;
            }
          })();
      
      // Filter by difficulty
      const difficultyMatch = difficultyFilter === "all" 
        ? true 
        : quiz.difficulty === difficultyFilter;
      
      return userMatch && searchMatch && difficultyMatch;
    });
  }, [quizzes, filter, user, debouncedSearchQuery, difficultyFilter]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Quiz Library
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover and play amazing quizzes
          </p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search quizzes by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              {searchQuery !== debouncedSearchQuery && (
                <LoadingSpinner size="sm" />
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === "all" 
                    ? "bg-black text-white" 
                    : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => setFilter("all")}
              >
                All Quizzes
              </button>
              <button 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === "my" 
                    ? "bg-black text-white" 
                    : !user 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-black border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => user && setFilter("my")}
                disabled={!user}
              >
                My Quizzes {!user && "(Login Required)"}
              </button>
            </div>

            {/* Difficulty Filter */}
            <div className="flex gap-2">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as "all" | "easy" | "medium" | "hard")}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white text-black focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Quiz Button */}
        <div className="flex justify-end mb-8">
          <Link
            href="/quiz/create"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Quiz
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <LoadingSpinner size="lg" text="Loading quizzes..." />
            <div className="text-gray-500 mt-2">Please wait while we fetch the latest quizzes</div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-xl font-semibold text-black mb-2">
              {debouncedSearchQuery.trim() !== "" || difficultyFilter !== "all" ? (
                "No quizzes found"
              ) : filter === "my" ? (
                user ? "No quizzes created yet" : "Login required"
              ) : "No quizzes available"}
            </div>
            <div className="text-gray-700 mb-6 max-w-md mx-auto">
              {debouncedSearchQuery.trim() !== "" || difficultyFilter !== "all" ? (
                "Try adjusting your search or filter criteria"
              ) : filter === "my" ? (
                user ? "Start creating your first quiz!" : "Please login to view your quizzes"
              ) : "Be the first to create a quiz"}
            </div>
            {filter === "my" && user && (
              <Link
                href="/quiz/create"
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Quiz
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                title={quiz.title}
                difficulty={getDifficultyLabel(quiz.difficulty)}
                difficultyColor={getDifficultyColor(quiz.difficulty)}
                questions={quiz.question_count || 0}
                author={quiz.author_name || 'Unknown'}
                plays={quiz.play_count || 0}
                onPlay={() => window.location.href = `/quiz/${quiz.id}`}
                onPlaySolo={() => {
                  // Create room for this quiz
                  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                  window.location.href = `/room/lobby?create=${quiz.id}&code=${roomCode}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
