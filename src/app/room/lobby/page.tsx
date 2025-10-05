"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { useQuiz } from "@/hooks/useQuiz";
import { joinRoomSchema, type JoinRoomFormData } from "@/lib/schemas";
import { useToast } from "@/hooks/useToast";

// Removed broken image URL

function JoinRoomContent() {
  const searchParams = useSearchParams();
  const [hostNickname, setHostNickname] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { joinRoom, createRoom, loading } = useRoom();
  const { user, loading: authLoading } = useAuth();
  const { quizzes, fetchQuizzes } = useQuiz();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JoinRoomFormData>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: "",
      nickname: "",
    },
  });

  // Load quizzes và auto-fill form từ URL parameters
  useEffect(() => {
    fetchQuizzes();
    
    // Check if we should auto-create room từ quiz list
    const createQuizId = searchParams.get('create');
    const createCode = searchParams.get('code');
    
    if (createQuizId && createCode) {
      setSelectedQuizId(createQuizId);
      setValue("roomCode", createCode);
    }
  }, []);

  const onJoinRoom = async (formData: JoinRoomFormData) => {
    // Join room với room code và nickname
    const { data, error } = await joinRoom({
      room_code: formData.roomCode.trim().toUpperCase(),
      nickname: formData.nickname.trim()
    });

    if (error) {
      toast({
        title: "Error",
        description: `Tham gia phòng thất bại: ${error}`,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      router.push(`/room/${data.room.id}`);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate quiz selection and host nickname
    if (!selectedQuizId) {
      toast({
        title: "Warning",
        description: "Vui lòng chọn quiz",
        variant: "destructive",
      });
      return;
    }
    
    if (!hostNickname.trim()) {
      toast({
        title: "Warning",
        description: "Vui lòng nhập tên hiển thị cho host",
        variant: "destructive",
      });
      return;
    }

    // Generate random room code (6 characters)
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create room với quiz ID, host ID, created_by và host_nickname
    const { data, error } = await createRoom({
      quiz_id: selectedQuizId,
      room_code: roomCode,
      host_id: user?.id || '',
      created_by: user?.id || '',
      host_nickname: hostNickname.trim()
    });

    if (error) {
      toast({
        title: "Error",
        description: `Tạo phòng thất bại: ${error}`,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      router.push(`/room/${data.id}`);
    }
  };


  // Redirect to login if not authenticated (only after auth loading is complete)
  useEffect(() => {
    if (!authLoading && !user && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/auth/login");
    }
  }, [user, authLoading, router, isRedirecting]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200/50 p-8 text-center">
            <LoadingSpinner size="xl" text="Loading..." />
            <p className="text-gray-600 mb-4">Please wait while we check your authentication</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200/50 p-8 text-center">
            <LoadingSpinner size="xl" text="Redirecting to Login..." />
            <p className="text-gray-600 mb-4">Please wait while we redirect you to sign in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Room Lobby</h1>
          <p className="text-lg text-gray-600">Join an existing room or create a new one</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Join Room */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200/50 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Join Room</h2>
            </div>
            <form onSubmit={handleSubmit(onJoinRoom)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Room Code</Label>
                <Input
                  id="roomCode"
                  placeholder="ABCD12"
                  {...register("roomCode")}
                  className={`text-center text-2xl font-bold tracking-widest uppercase ${errors.roomCode ? "border-red-500" : ""}`}
                />
                {errors.roomCode && (
                  <p className="text-red-500 text-sm">{errors.roomCode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="Enter your nickname"
                  {...register("nickname")}
                  className={errors.nickname ? "border-red-500" : ""}
                />
                {errors.nickname && (
                  <p className="text-red-500 text-sm">{errors.nickname.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Room"}
              </Button>
            </form>
          </div>

          {/* Create Room */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200/50 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Room</h2>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hostNickname">Your Nickname (as Host)</Label>
                <Input
                  id="hostNickname"
                  placeholder="Enter your nickname"
                  value={hostNickname}
                  onChange={(e) => setHostNickname(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quizSelect">Select Quiz</Label>
                <Select
                  value={selectedQuizId}
                  onValueChange={setSelectedQuizId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a quiz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.difficulty})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading || !selectedQuizId || !hostNickname.trim()}
              >
                {loading ? "Creating..." : "Create Room"}
              </Button>
            </form>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border-2 border-gray-200/50 p-8 hover:shadow-xl transition-all duration-300">
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">How it works:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-lg text-gray-900">Join or Create</h4>
                <p className="text-gray-600">Enter a room code or create your own</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-lg text-gray-900">Wait for Players</h4>
                <p className="text-gray-600">Invite friends to join your room</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-lg text-gray-900">Play Together</h4>
                <p className="text-gray-600">Answer questions in real-time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinRoom() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
      <JoinRoomContent />
    </Suspense>
  );
}
