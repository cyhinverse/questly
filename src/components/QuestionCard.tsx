"use client";

import React from "react";
import { useSound } from "@/lib/sound";

type QuestionCardProps = {
  question: string;
  options: string[];
  selectedOption?: number;
  onSelect?: (idx: number) => void;
  correctAnswer?: number;
  timeLeft?: number;
  onAnswer?: (answerIndex: number) => void;
  selectedAnswer?: number | null;
  showResult?: boolean;
};

export const QuestionCard = React.memo(function QuestionCard({
  question,
  options,
  selectedOption,
  onSelect,
  correctAnswer,
  timeLeft,
  onAnswer,
  selectedAnswer,
  showResult = false,
}: QuestionCardProps) {
  const { playAnswerSelect, playCorrectAnswer, playWrongAnswer } = useSound();
  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return `w-full border border-gray-300 rounded-lg px-4 py-3 text-left hover:bg-gray-100 transition cursor-pointer ${
        selectedOption === index || selectedAnswer === index
          ? "bg-gray-100 border-gray-400"
          : ""
      }`;
    }

    if (index === correctAnswer) {
      return "w-full border-2 border-green-500 bg-green-100 rounded-lg px-4 py-3 text-left";
    }

    if (index === selectedAnswer && index !== correctAnswer) {
      return "w-full border-2 border-red-500 bg-red-100 rounded-lg px-4 py-3 text-left";
    }

    return "w-full border border-gray-300 rounded-lg px-4 py-3 text-left bg-gray-50 opacity-60";
  };

  const getOptionTextStyle = (index: number) => {
    if (!showResult) {
      return "font-medium text-black";
    }

    if (index === correctAnswer) {
      return "font-medium text-green-800";
    }

    if (index === selectedAnswer && index !== correctAnswer) {
      return "font-medium text-red-800";
    }

    return "font-medium text-gray-500";
  };

  const handleClick = (index: number) => {
    // Play sound when selecting answer
    if (!showResult) {
      playAnswerSelect();
    } else {
      // Play different sounds based on result
      if (index === correctAnswer) {
        playCorrectAnswer();
      } else if (index === selectedAnswer && index !== correctAnswer) {
        playWrongAnswer();
      }
    }

    if (onAnswer) {
      onAnswer(index);
    } else if (onSelect) {
      onSelect(index);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium text-black">{question}</div>
        {timeLeft !== undefined && (
          <div
            className={`text-xl font-bold ${
              timeLeft <= 5 ? "text-red-500" : "text-black"
            }`}
          >
            {timeLeft}s
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={getOptionStyle(idx)}
            onClick={() => handleClick(idx)}
            disabled={showResult}
          >
            <span className={getOptionTextStyle(idx)}>{opt}</span>
            {showResult && idx === correctAnswer && (
              <span className="ml-2 text-green-600 font-bold">✓</span>
            )}
            {showResult && idx === selectedAnswer && idx !== correctAnswer && (
              <span className="ml-2 text-red-600 font-bold">✗</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});
