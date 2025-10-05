"use client";

import * as React from "react"
import { useToast } from "@/hooks/useToast"

// Toast-based ErrorMessage component
interface ErrorMessageProps {
  error: string | null;
  className?: string;
  onDismiss?: () => void;
  variant?: "destructive" | "success" | "warning" | "info";
  showAsToast?: boolean; // New prop to control display method
}

export function ErrorMessage({ 
  error, 
  className = "", 
  onDismiss,
  variant = "destructive",
  showAsToast = true
}: ErrorMessageProps) {
  const { toast } = useToast();

  React.useEffect(() => {
    if (error && showAsToast) {
      toast({
        variant: variant,
        title: variant === "destructive" ? "Error" : 
               variant === "success" ? "Success" :
               variant === "warning" ? "Warning" : "Info",
        description: error,
      });
    }
  }, [error, variant, showAsToast, toast]);

  // For backward compatibility, return null when using toast
  if (showAsToast) {
    return null;
  }

  // Fallback to inline display if showAsToast is false
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-red-400 hover:text-red-600 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Success message component with toast support
interface SuccessMessageProps {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
  showAsToast?: boolean;
}

export function SuccessMessage({ 
  message, 
  className = "", 
  onDismiss,
  showAsToast = true
}: SuccessMessageProps) {
  const { toast } = useToast();

  React.useEffect(() => {
    if (message && showAsToast) {
      toast({
        variant: "success",
        title: "Success",
        description: message,
      });
    }
  }, [message, showAsToast, toast]);

  // For backward compatibility, return null when using toast
  if (showAsToast) {
    return null;
  }

  // Fallback to inline display if showAsToast is false
  if (!message) return null;

  return (
    <div className={`bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 7.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-green-400 hover:text-green-600 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Utility functions for easy toast usage - these should be used inside components
export const useToastHelpers = () => {
  const { toast } = useToast();
  
  return {
    error: (message: string) => {
      return toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
    success: (message: string) => {
      return toast({
        variant: "success",
        title: "Success",
        description: message,
      });
    },
    warning: (message: string) => {
      return toast({
        variant: "warning",
        title: "Warning",
        description: message,
      });
    },
    info: (message: string) => {
      return toast({
        variant: "info",
        title: "Info",
        description: message,
      });
    },
  };
};
