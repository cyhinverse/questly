import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BodyWrapper } from "@/components/BodyWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { NetworkError } from "@/components/NetworkError";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  preload: true,
});

export const metadata: Metadata = {
  title: "QuizMaster - Create and Play Amazing Quizzes",
  description: "Discover, create, and play interactive quizzes with QuizMaster. Test your knowledge and challenge others!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <BodyWrapper>
            <NetworkError />
            {children}
          </BodyWrapper>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
