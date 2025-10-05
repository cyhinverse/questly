"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormWrapper } from "@/components/Modal";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { validatePassword, validateConfirmPassword, sanitizeInput } from "@/lib/validation";
import { supabase } from "@/lib/supabaseClient";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { updatePassword, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get access token from URL
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    // Handle password reset flow
    const handlePasswordReset = async () => {
      // If we have tokens in URL, set the session
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        
        if (error) {
          console.error('Error setting session:', error);
          router.push("/auth/forgot-password");
          return;
        }
      } else {
        // Check if we already have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/auth/forgot-password");
        }
      }
    };

    handlePasswordReset();
  }, [accessToken, refreshToken, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate passwords
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

    const allErrors: Record<string, string> = {};
    
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(err => {
        allErrors[err.field] = err.message;
      });
    }
    
    if (!confirmPasswordValidation.isValid) {
      confirmPasswordValidation.errors.forEach(err => {
        allErrors[err.field] = err.message;
      });
    }

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);
    if (!error) {
      setIsSuccess(true);
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <FormWrapper>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Password Updated!</h1>
          <p className="text-gray-700 mb-6">
            Your password has been successfully updated.
          </p>
          <Button 
            variant="primary" 
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            Sign In with New Password
          </Button>
        </div>
      </FormWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-black">Set New Password</h1>
            <p className="text-gray-700 mb-6">Enter your new password below</p>
          </div>

          <ErrorMessage error={error} showAsToast={true} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <InputField
                id="password"
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>
            
            <div>
              <InputField
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
            
            <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
              {isLoading ? <LoadingSpinner size="sm" text="Updating..." /> : "Update Password"}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
