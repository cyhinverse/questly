"use client";

import React from "react";

type QuizCardProps = {
  title: string;
  difficulty: string;
  difficultyColor: string;
  questions: number;
  author: string;
  plays: number;
  onPlay?: () => void;
  onPlaySolo?: () => void;
};

export const QuizCard = React.memo(function QuizCard({
  title,
  difficulty,
  difficultyColor,
  questions,
  author,
  plays,
  onPlay,
  onPlaySolo,
}: QuizCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow h-full flex flex-col w-full max-w-sm mx-auto">
      {/* Header with fixed height */}
      <div className="flex items-start justify-between mb-4 h-16">
        <h2 className="text-lg font-semibold text-black line-clamp-2 flex-1 mr-3 leading-tight">
          {title}
        </h2>
        <span
          className={`text-xs text-white px-2 py-1 rounded-full font-medium ${difficultyColor} flex-shrink-0 h-fit`}
        >
          {difficulty}
        </span>
      </div>

      {/* Info section with fixed height */}
      <div className="flex justify-between items-center text-gray-700 text-sm mb-6 min-h-5">
        <div className="flex-1 text-center truncate">{questions} questions</div>
        <div className="flex-1 text-center truncate">By {author}</div>
        <div className="flex-1 text-center truncate">{plays} plays</div>
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1"></div>

      {/* Buttons section - always at bottom */}
      <div className="flex gap-2 mt-auto">
        <button
          className="flex-1 bg-black hover:bg-gray-800 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors cursor-pointer"
          onClick={onPlay}
        >
          Play Solo
        </button>

        {onPlaySolo && (
          <button
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-black text-sm font-medium py-2 px-3 rounded-md transition-colors cursor-pointer"
            onClick={onPlaySolo}
          >
            Create Room
          </button>
        )}
      </div>
    </div>
  );
});
