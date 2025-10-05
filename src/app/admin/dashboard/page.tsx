"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, 
  FileText, 
  Play, 
  TrendingUp
} from "lucide-react";

interface DashboardStats {
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
  recentPlays: Array<{
    id: string;
    quiz_title: string;
    score: number;
    played_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        usersResult,
        quizzesResult,
        playsResult,
        roomsResult,
        recentUsersResult,
        recentQuizzesResult,
        recentPlaysResult
      ] = await Promise.all([
        supabase.from('profiles').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('quiz').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('quiz_plays').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('room').select('id').then(res => ({ count: res.data?.length || 0, error: res.error })),
        supabase.from('profiles').select('id, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('quiz').select('id, title, created_at, play_count').order('created_at', { ascending: false }).limit(5),
        supabase.from('quiz_plays').select('id, quiz_title, score, played_at').order('played_at', { ascending: false }).limit(5)
      ]);

      // Check for errors
      if (usersResult.error || quizzesResult.error || playsResult.error || roomsResult.error) {
        throw new Error('Failed to fetch dashboard data');
      }

      setStats({
        totalUsers: usersResult.count,
        totalQuizzes: quizzesResult.count,
        totalPlays: playsResult.count,
        totalRooms: roomsResult.count,
        recentUsers: recentUsersResult.data || [],
        recentQuizzes: recentQuizzesResult.data || [],
        recentPlays: recentPlaysResult.data || []
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
        <LoadingSpinner size="lg" text="Loading dashboard..." />
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

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-sans font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-lg font-sans text-gray-600 mt-2">Welcome to Questly Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlays}</div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quizzes */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quizzes</CardTitle>
            <CardDescription>Latest created quizzes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {quiz.play_count} plays • {new Date(quiz.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">{quiz.play_count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Plays */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Plays</CardTitle>
            <CardDescription>Latest quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPlays.map((play) => (
                <div key={play.id} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{play.quiz_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(play.played_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="default">{play.score} pts</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
