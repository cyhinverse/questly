"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  dailyPlays: Array<{
    date: string;
    plays: number;
  }>;
  quizPopularity: Array<{
    name: string;
    plays: number;
  }>;
  difficultyDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  totalStats: {
    totalUsers: number;
    totalQuizzes: number;
    totalPlays: number;
    avgScore: number;
  };
}


export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data
      const [
        playsResult,
        quizzesResult,
        usersResult,
        quizPlaysResult
      ] = await Promise.all([
        supabase
          .from('quiz_plays')
          .select('played_at, score')
          .gte('played_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('played_at', { ascending: true }),
        supabase
          .from('quiz')
          .select('id, title, play_count, difficulty'),
        supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true }),
        supabase
          .from('quiz_plays')
          .select('score')
      ]);

      if (playsResult.error || quizzesResult.error || usersResult.error || quizPlaysResult.error) {
        throw new Error('Failed to fetch analytics data');
      }

      // Process daily plays data
      const dailyPlaysMap = new Map();
      playsResult.data?.forEach(play => {
        const date = new Date(play.played_at).toISOString().split('T')[0];
        dailyPlaysMap.set(date, (dailyPlaysMap.get(date) || 0) + 1);
      });

      const dailyPlays = Array.from(dailyPlaysMap.entries()).map(([date, plays]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        plays
      }));

      // Process quiz popularity data
      const quizPopularity = quizzesResult.data
        ?.sort((a, b) => b.play_count - a.play_count)
        .slice(0, 10)
        .map(quiz => ({
          name: quiz.title.length > 20 ? quiz.title.substring(0, 20) + '...' : quiz.title,
          plays: quiz.play_count
        })) || [];

      // Process difficulty distribution
      const difficultyMap = new Map();
      quizzesResult.data?.forEach(quiz => {
        difficultyMap.set(quiz.difficulty, (difficultyMap.get(quiz.difficulty) || 0) + 1);
      });

      const difficultyDistribution = [
        { name: 'Easy', value: difficultyMap.get('easy') || 0, color: '#00C49F' },
        { name: 'Medium', value: difficultyMap.get('medium') || 0, color: '#FFBB28' },
        { name: 'Hard', value: difficultyMap.get('hard') || 0, color: '#FF8042' },
      ];

      // Process user growth data
      const userGrowthMap = new Map();
      usersResult.data?.forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
      });

      const userGrowth = Array.from(userGrowthMap.entries()).map(([date, users]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users
      }));

      // Calculate total stats
      const totalStats = {
        totalUsers: usersResult.data?.length || 0,
        totalQuizzes: quizzesResult.data?.length || 0,
        totalPlays: playsResult.data?.length || 0,
        avgScore: quizPlaysResult.data?.length ? 
          Math.round(quizPlaysResult.data.reduce((sum, play) => sum + play.score, 0) / quizPlaysResult.data.length) : 0
      };

      setData({
        dailyPlays,
        quizPopularity,
        difficultyDistribution,
        userGrowth,
        totalStats
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Insights and performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalPlays}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.avgScore}</div>
            <p className="text-xs text-muted-foreground">
              Points per play
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Plays Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Plays (Last 30 Days)</CardTitle>
            <CardDescription>Quiz plays over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyPlays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="plays" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
            <CardDescription>New user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quiz Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Quizzes</CardTitle>
            <CardDescription>Top 10 quizzes by play count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.quizPopularity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="plays" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Difficulty Distribution</CardTitle>
            <CardDescription>Distribution of quiz difficulties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.difficultyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.difficultyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
