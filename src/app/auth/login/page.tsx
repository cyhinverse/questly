"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useToast } from "@/hooks/useToast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, error } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        router.push("/");
      } else {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Clear any validation errors before Google sign in
    clearErrors();
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "Signed in with Google successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-black">QuizMaster</h1>
            <p className="text-gray-700">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
            
            <div className="text-center mt-4">
              <button
                onClick={() => router.push("/auth/forgot-password")}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Forgot your password?
              </button>
            </div>
            
          </form>
          
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          <GoogleSignInButton 
            onClick={handleGoogleSignIn} 
            disabled={isLoading} 
            isLoading={isLoading}
          />
          
          <div className="text-center text-sm text-gray-700 mt-2">
            Don&apos;t have an account?{" "}
            <a href="/auth/register" className="font-medium text-black hover:underline">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
