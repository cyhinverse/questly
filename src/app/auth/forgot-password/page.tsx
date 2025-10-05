"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormWrapper } from "@/components/Modal";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, sanitizeInput } from "@/lib/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { resetPassword, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      const errors: Record<string, string> = {};
      emailValidation.errors.forEach(err => {
        errors[err.field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(sanitizeInput(email));
    if (!error) {
      setIsEmailSent(true);
    }
    setIsLoading(false);
  };

  if (isEmailSent) {
    return (
      <FormWrapper>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Check Your Email</h1>
          <p className="text-gray-700 mb-6">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please check your email and click the link to reset your password. The link will expire in 1 hour.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEmailSent(false)}
              className="w-full"
            >
              Try Another Email
            </Button>
            <Button 
              variant="primary" 
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </FormWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-black">Reset Password</h1>
            <p className="text-gray-700 mb-6">Enter your email to receive a password reset link</p>
          </div>

          <ErrorMessage error={error} showAsToast={true} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <InputField
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
              {isLoading ? <LoadingSpinner size="sm" text="Sending..." /> : "Send Reset Link"}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <button
              onClick={() => router.push("/auth/login")}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Remember your password? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
