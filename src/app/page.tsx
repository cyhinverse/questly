"use client";

import Link from "next/link";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-sans font-bold text-black mb-6 tracking-tight">
          Create & Play Amazing Quizzes
        </h1>
        <p className="text-xl font-sans text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover, create, and play interactive quizzes with friends. Test your knowledge and challenge others in real-time!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/quiz">
            <Button variant="primary" className="px-8 py-4 text-lg font-sans font-semibold bg-black hover:bg-gray-800 text-white tracking-wide">
              Browse Quizzes
            </Button>
          </Link>
          <Link href="/room/lobby">
            <Button variant="outline" className="px-8 py-4 text-lg font-sans font-semibold bg-white text-black border border-gray-300 hover:bg-gray-100 tracking-wide">
              Join a Room
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-sans font-semibold text-black mb-3 tracking-tight">Create Quizzes</h3>
            <p className="text-gray-700 font-sans leading-relaxed">Build custom quizzes with multiple choice questions and share with friends</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-sans font-semibold text-black mb-3 tracking-tight">Play Together</h3>
            <p className="text-gray-700 font-sans leading-relaxed">Join rooms and compete with friends in real-time quiz battles</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-sans font-semibold text-black mb-3 tracking-tight">Track Progress</h3>
            <p className="text-gray-700 font-sans leading-relaxed">Monitor your performance and climb the leaderboards</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-700">© 2024 QuizMaster. Made with ❤️ for quiz lovers.</p>
        </div>
      </div>
    </div>
  );
}
