"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/useToast";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { user, signOut, loading: authLoading } = useAuth();
  const { stats, loading: statsLoading, error: statsError } = useUserStats(user?.id || null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadUserData();
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
    } catch {
      setIsAdmin(false);
    }
  };

  const loadUserData = async () => {
    if (user) {
      // Load user data from auth user metadata
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || '';
      const avatarUrl = user.user_metadata?.avatar_url || null;
      
      reset({
        displayName,
      });
      setAvatarPreview(avatarUrl);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      loadUserData();
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: data.displayName,
          avatar_url: avatarPreview
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 pt-20">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <LoadingSpinner size="lg" text="Loading your profile..." />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show sign in required if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 pt-24">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-sans font-semibold text-gray-900 mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-8 font-sans">Please sign in to view your profile</p>
              <Button 
                onClick={() => router.push("/auth/login")}
                size="lg"
                className="px-8 py-3"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600">Manage your account and view statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card - Simple */}
          <div className="lg:col-span-1">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                {/* Avatar Section - Compact */}
                <div className="text-center mb-6">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                      {avatarPreview ? (
                        <Image 
                          src={avatarPreview} 
                          alt="Avatar" 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-600 font-semibold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors text-xs"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{watch("displayName") || 'User'}</h3>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {/* Profile Form - Compact */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs font-medium text-gray-600">Display Name</Label>
                    <Input
                      id="displayName"
                      {...register("displayName")}
                      disabled={!isEditing}
                      placeholder="Enter name"
                      className={`text-sm ${errors.displayName ? "border-red-500" : ""}`}
                    />
                    {errors.displayName && (
                      <p className="text-xs text-red-500">{errors.displayName.message}</p>
                    )}
                  </div>


                  {/* Action Buttons - Compact */}
                  <div className="space-y-2 pt-2">
                    {isEditing ? (
                      <>
                        <Button type="submit" size="sm" className="w-full">
                          Save
                        </Button>
                        <Button
                          type="button"
                          onClick={handleEditToggle}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleEditToggle}
                          size="sm"
                          className="w-full"
                        >
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            onClick={() => router.push("/admin")}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin
                          </Button>
                        )}
                        <Button
                          onClick={handleSignOut}
                          variant="destructive"
                          size="sm"
                          className="w-full"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section - Simple */}
          <div className="lg:col-span-2 space-y-4">
            {/* User Statistics */}
            {stats && (
              <>
                {/* Main Stats Grid - Simple */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Quiz Statistics</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalQuizzesCreated}</div>
                        <div className="text-xs text-gray-600">Created</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalQuizzesPlayed}</div>
                        <div className="text-xs text-gray-600">Played</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalScore}</div>
                        <div className="text-xs text-gray-600">Total Score</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stats.averageScore}</div>
                        <div className="text-xs text-gray-600">Average</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Room Stats - Simple */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Room Activity</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-gray-900 mb-1">{stats.totalRoomsCreated}</div>
                        <div className="text-xs text-gray-600">Created</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-gray-900 mb-1">{stats.totalRoomsJoined}</div>
                        <div className="text-xs text-gray-600">Joined</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity - Simple */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent Quizzes */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Quizzes</h3>
                    </CardHeader>
                    <CardContent>
                      {stats.recentQuizzes.length > 0 ? (
                        <div className="space-y-2">
                          {stats.recentQuizzes.slice(0, 3).map((quiz) => (
                            <div key={quiz.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{quiz.title}</div>
                                <div className="text-xs text-gray-500">{quiz.question_count} questions • {quiz.play_count} plays</div>
                              </div>
                              <div className="text-xs text-gray-400 ml-3">
                                {new Date(quiz.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No quizzes created yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Plays */}
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Plays</h3>
                    </CardHeader>
                    <CardContent>
                      {stats.recentPlays.length > 0 ? (
                        <div className="space-y-2">
                          {stats.recentPlays.slice(0, 3).map((play, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{play.quiz_title}</div>
                                <div className="text-xs text-gray-500">{play.correct_answers}/{play.total_questions} correct • {play.score} points</div>
                              </div>
                              <div className="text-xs text-gray-400 ml-3">
                                {new Date(play.played_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No quiz plays yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Loading State - Simple */}
            {statsLoading && (
              <Card className="border shadow-sm">
                <CardContent className="p-6 text-center">
                  <LoadingSpinner size="md" text="Loading..." />
                </CardContent>
              </Card>
            )}

            {/* Error State - Simple */}
            {statsError && (
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading statistics</h3>
                  <p className="text-sm text-red-500 mb-4">{statsError}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}